import { useState, useEffect, useCallback } from 'react';
import { AppState, User, ChoirEvent, Attendance, Announcement, UserRole, VoicePart, UserStatus } from '../types';
import { supabase, supabaseUrl, supabaseAnonKey, createClient } from '../supabase';
import { loadState, saveState } from '../store';

export const useAppController = () => {
  // Initialize state directly from local storage for instant load
  const [state, setState] = useState<AppState>(() => loadState());
  
  // LOGIC CHANGE: 
  // Jika ada user di localStorage, set loading false agar UI langsung muncul (Cache First).
  // Verifikasi session dilakukan di background.
  const [loading, setLoading] = useState(() => {
    const saved = loadState();
    return !saved.currentUser; // Hanya loading jika tidak ada user tersimpan
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture install prompt for PWA (Chrome/Android)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Save state to local storage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Fetch Public App Settings (Logo, etc) independent of Auth
  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'app_logo_url')
          .single();
        
        if (data && data.value) {
          setState(prev => ({ ...prev, appLogoUrl: data.value }));
        }
      } catch (err) {
        // Silent fail for public settings
      }
    };
    fetchPublicSettings();
  }, []);

  const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as UserRole,
    voicePart: profile.voice_part as VoicePart,
    phone: profile.phone || '',
    status: (profile.status as UserStatus) || UserStatus.PENDING,
  });

  const fetchData = useCallback(async (userId?: string) => {
    try {
      const activeId = userId || (await supabase.auth.getSession()).data.session?.user.id;
      
      if (!activeId) {
        setState(prev => ({ ...prev, currentUser: null }));
        return;
      }

      // Fetch profile first to validate status
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeId)
        .single();

      if (!profile || (profile.role !== UserRole.ADMIN && profile.status !== UserStatus.ACTIVE)) {
        // If user is invalid/deleted/banned in DB, log them out
        await supabase.auth.signOut();
        setState(prev => ({ ...prev, currentUser: null }));
        return;
      }

      // Parallel Fetching
      const [
        { data: users },
        { data: events },
        { data: attendance },
        { data: announcements }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('attendance').select('*'),
        supabase.from('announcements').select('*').order('timestamp', { ascending: false })
      ]);

      // Update State with fresh data
      setState(prev => ({
        ...prev,
        currentUser: mapProfileToUser(profile),
        users: (users || []).map(mapProfileToUser),
        events: (events || []).map(e => ({
          ...e,
          isImportant: e.is_important, 
          category: e.category
        })) as ChoirEvent[],
        attendance: (attendance || []).map(a => ({
          userId: a.user_id,
          eventId: a.event_id,
          status: a.status,
          reason: a.reason,
          timestamp: new Date(a.timestamp).getTime()
        })) as Attendance[],
        announcements: (announcements || []).map(an => ({
          id: an.id,
          title: an.title,
          content: an.content,
          author: users?.find(u => u.id === an.author_id)?.name || 'Admin', 
          timestamp: new Date(an.timestamp).getTime()
        })) as Announcement[],
      }));
    } catch (error) {
      console.error('Fetch data error:', error);
      // Don't clear state on fetch error (keep offline data)
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // We have a session, fetch fresh data in background
          await fetchData(session.user.id);
        } else {
          // No session
          if (state.currentUser) {
              // If we thought we were logged in (localStorage) but Supabase says no,
              // we must clear the user.
              setState(prev => ({ ...prev, currentUser: null }));
          }
        }
      } catch (e) {
        console.error("Session check failed", e);
      } finally {
        // Ensure loading is turned off eventually
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) await fetchData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({
          ...prev,
          currentUser: null,
          users: [],
          events: [],
          attendance: [],
          announcements: [],
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  const login = async (email: string, password?: string) => {
    // Manual login always triggers loading
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });
      
      if (error) throw error;

      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status, role')
          .eq('id', authData.user.id)
          .single();
        
        if (profile) {
          if (profile.role !== UserRole.ADMIN && profile.status === UserStatus.PENDING) {
            await supabase.auth.signOut();
            throw new Error("Akun Anda sedang dalam proses verifikasi Admin. Mohon tunggu persetujuan.");
          }
          if (profile.role !== UserRole.ADMIN && profile.status === UserStatus.REJECTED) {
            await supabase.auth.signOut();
            throw new Error("Maaf, akun Anda tidak disetujui untuk mengakses aplikasi ini.");
          }
          // Fetch data immediately after successful login
          await fetchData(authData.user.id);
        }
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({
        ...prev,
        currentUser: null,
        users: [],
        events: [],
        attendance: [],
        announcements: [],
      }));
      localStorage.removeItem('vos_app_state');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const signUp = async (userData: Omit<User, 'id' | 'status'>) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || '',
      options: {
        data: {
          name: userData.name,
          role: UserRole.USER,
          voice_part: userData.voicePart,
          phone: userData.phone,
          status: UserStatus.PENDING 
        }
      }
    });
    if (error) throw error;
    await supabase.auth.signOut();
    return data;
  };

  const approveUser = async (userId: string) => {
    await supabase.from('profiles').update({ status: UserStatus.ACTIVE }).eq('id', userId);
    await fetchData();
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const { error } = await supabase.from('profiles').update({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        voice_part: userData.voicePart,
        phone: userData.phone,
        status: userData.status
      }).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const registerUser = async (userData: Omit<User, 'id' | 'status'>) => {
    const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const { error } = await tempSupabase.auth.signUp({
      email: userData.email,
      password: userData.password || '123456',
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          voice_part: userData.voicePart,
          phone: userData.phone,
          status: UserStatus.ACTIVE 
        }
      }
    });
    if (error) throw error;
    await fetchData();
  };

  const resetUserPassword = async (userId: string) => {
    const { error } = await supabase.rpc('reset_user_password_default', { target_user_id: userId });
    if (error) {
      await supabase.from('profiles').update({ password: '123456' }).eq('id', userId);
    }
    await fetchData();
  };

  const submitAttendance = async (eventId: string, status: 'present' | 'absent', reason?: string) => {
    if (!state.currentUser) return;
    
    // Optimistic Update (Update UI dulu sebelum server)
    const newAttendance: Attendance = {
      userId: state.currentUser.id,
      eventId,
      status,
      reason,
      timestamp: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      attendance: [
        ...prev.attendance.filter(a => !(a.userId === newAttendance.userId && a.eventId === newAttendance.eventId)),
        newAttendance
      ]
    }));

    const { error } = await supabase.from('attendance').upsert({
      user_id: state.currentUser.id,
      event_id: eventId,
      status,
      reason: reason || null,
      timestamp: new Date().toISOString()
    }, { onConflict: 'user_id,event_id' });
    
    if (error) {
      // Revert/Refresh if failed
      await fetchData();
      throw error;
    }
  };

  const addEvent = async (eventData: Omit<ChoirEvent, 'id'>) => {
    await supabase.from('events').insert({
      title: eventData.title,
      date: eventData.date,
      location: eventData.location,
      description: eventData.description,
      is_important: eventData.isImportant,
      category: eventData.category
    });
    await fetchData();
  };

  const updateEvent = async (id: string, eventData: Omit<ChoirEvent, 'id'>) => {
    await supabase.from('events').update({
      title: eventData.title,
      date: eventData.date,
      location: eventData.location,
      description: eventData.description,
      is_important: eventData.isImportant,
      category: eventData.category
    }).eq('id', id);
    await fetchData();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    await fetchData();
  };

  const addAnnouncement = async (title: string, content: string) => {
    if (!state.currentUser) return;
    await supabase.from('announcements').insert({
      title,
      content,
      author_id: state.currentUser.id
    });
    await fetchData();
  };

  const updateAnnouncement = async (id: string, title: string, content: string) => {
    await supabase.from('announcements').update({ title, content }).eq('id', id);
    await fetchData();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    await fetchData();
  };

  const adminSubmitAttendance = async (userId: string, eventId: string, status: 'present' | 'absent', reason?: string) => {
    await supabase.from('attendance').upsert({
      user_id: userId,
      event_id: eventId,
      status,
      reason: reason || null,
      timestamp: new Date().toISOString()
    }, { onConflict: 'user_id,event_id' });
    await fetchData();
  };

  const adminRemoveAttendance = async (userId: string, eventId: string) => {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);
    if (error) throw error;
    await fetchData();
  };

  return {
    state,
    loading,
    installApp, // Export install function
    isInstallable: !!deferredPrompt, // Export status
    login,
    signUp,
    logout,
    registerUser,
    approveUser,
    updateUser,
    submitAttendance,
    adminSubmitAttendance,
    adminRemoveAttendance,
    addEvent,
    updateEvent,
    deleteEvent,
    deleteUser,
    resetUserPassword,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refreshData: fetchData
  };
};