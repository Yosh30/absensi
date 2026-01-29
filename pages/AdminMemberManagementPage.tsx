import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, UserPlus, Check, X, Trash2, Key, CheckCircle2, Users, Music, Edit2, AlertTriangle, Square, CheckSquare, ChevronDown, Mail, Smartphone, Download, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { User, UserRole, UserStatus, VoicePart } from '../types';
import { RegisterUserModal } from '../components/RegisterUserModal';

interface ConfirmationModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  confirmText: string;
  type?: 'danger' | 'warning' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 p-8 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
        }`}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{title}</h3>
        <p className="text-slate-500 text-[13px] leading-relaxed mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            Batal
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`flex-[2] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${
              type === 'danger' ? 'bg-red-600 shadow-red-100 border-red-500' : 'bg-amber-500 shadow-amber-100 border-amber-400'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminMemberManagementPage = () => {
  const { state, deleteUser, resetUserPassword, approveUser, registerUser, updateUser } = useApp();
  const navigate = useNavigate();
  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  // Default collapse state changed to false for both
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);
  const [isActiveExpanded, setIsActiveExpanded] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  // Date Picker States (Default: Bulan Ini)
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    // Tanggal 1 bulan ini format YYYY-MM-DD
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    // Default: Akhir bulan ini (bukan hari ini)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [memberToAction, setMemberToAction] = useState<{users: User[], action: 'delete' | 'reset'} | null>(null);
  const [showSuccessReset, setShowSuccessReset] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  
  // New State for History Modal
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<User | null>(null);

  // --- LOGIC RIWAYAT BULAN INI UNTUK MODAL DETAIL ---
  const historyData = useMemo(() => {
    if (!selectedMemberForHistory) return null;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyEvents = state.events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear &&
             ['Latihan', 'Pelayanan'].includes(e.category);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mappedEvents = monthlyEvents.map(event => {
        const attendance = state.attendance.find(a => a.eventId === event.id && a.userId === selectedMemberForHistory.id);
        return {
            ...event,
            status: attendance ? attendance.status : 'none', // 'none' means absen/alpha/belum isi
        };
    });

    const presentCount = mappedEvents.filter(e => e.status === 'present').length;
    const percentage = monthlyEvents.length > 0 ? Math.round((presentCount / monthlyEvents.length) * 100) : 0;

    return { events: mappedEvents, stats: { present: presentCount, total: monthlyEvents.length, percentage } };
  }, [selectedMemberForHistory, state.events, state.attendance]);

  // --- LOGIC KEHADIRAN BULAN INI (Untuk Tampilan Card UI) ---
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Ambil Event Bulan Ini (Latihan & Pelayanan)
    const monthlyEvents = state.events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear &&
             ['Latihan', 'Pelayanan'].includes(e.category);
    });

    const totalEvents = monthlyEvents.length;

    // 2. Helper function untuk hitung persen per user
    const getUserPercent = (userId: string) => {
      if (totalEvents === 0) return 0;
      const presentCount = monthlyEvents.filter(e => {
        const att = state.attendance.find(a => a.eventId === e.id && a.userId === userId);
        return att?.status === 'present';
      }).length;
      return Math.round((presentCount / totalEvents) * 100);
    };

    return { totalEvents, getUserPercent };
  }, [state.events, state.attendance]);
  // ---------------------------------

  const stats = useMemo(() => {
    const active = state.users.filter(u => u.status === UserStatus.ACTIVE);
    return {
      total: active.length,
      sopran: active.filter(u => u.voicePart === VoicePart.SOPRAN).length,
      alto: active.filter(u => u.voicePart === VoicePart.ALTO).length,
      tenor: active.filter(u => u.voicePart === VoicePart.TENOR).length,
      bass: active.filter(u => u.voicePart === VoicePart.BASS).length,
    };
  }, [state.users]);

  const pendingUsers = useMemo(() => {
    return state.users.filter(u => u.status === UserStatus.PENDING);
  }, [state.users]);

  const filteredUsers = useMemo(() => {
    return state.users
      .filter(u => u.status === UserStatus.ACTIVE)
      .filter(u => 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.voicePart.toLowerCase().includes(userSearchQuery.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.users, userSearchQuery]);

  const groupedUsers = useMemo(() => {
    return {
      [VoicePart.SOPRAN]: filteredUsers.filter(u => u.voicePart === VoicePart.SOPRAN),
      [VoicePart.ALTO]: filteredUsers.filter(u => u.voicePart === VoicePart.ALTO),
      [VoicePart.TENOR]: filteredUsers.filter(u => u.voicePart === VoicePart.TENOR),
      [VoicePart.BASS]: filteredUsers.filter(u => u.voicePart === VoicePart.BASS),
    };
  }, [filteredUsers]);

  const toggleSelectUser = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedUserIds(newSelected);
  };

  const executeAction = async () => {
    if (!memberToAction) return;
    const { users, action } = memberToAction;
    try {
      if (action === 'delete') {
        await Promise.all(users.map(u => deleteUser(u.id)));
      } else {
        await Promise.all(users.map(u => resetUserPassword(u.id)));
        setShowSuccessReset(true);
      }
      setSelectedUserIds(new Set());
      setMemberToAction(null);
    } catch (err) { alert("Gagal memproses aksi."); }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userToEdit) {
      try {
        await updateUser(userToEdit.id, userToEdit);
        setUserToEdit(null);
        setShowUpdateSuccess(true);
      } catch (err) { alert("Gagal memperbarui data."); }
    }
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!startDate || !endDate) {
      alert("Mohon pilih tanggal mulai dan selesai.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set jam end date ke akhir hari agar event di hari itu terambil
    end.setHours(23, 59, 59);

    if (start > end) {
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal selesai.");
      return;
    }

    const fileName = `Rekap_${startDate}_sd_${endDate}`;

    // 1. Ambil Event Sesuai Range Date Picker
    const eventsInRange = state.events.filter(ev => {
      const d = new Date(ev.date);
      return d >= start && 
             d <= end && 
             ['Latihan', 'Pelayanan'].includes(ev.category);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (eventsInRange.length === 0) {
      alert("Tidak ada jadwal Latihan/Pelayanan dalam rentang tanggal yang dipilih.");
      return;
    }

    // 2. Buat Header CSV
    const dateHeaders = eventsInRange.map(ev => {
        const d = new Date(ev.date);
        return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
    });
    
    const headers = ['Nama', ...dateHeaders, 'Persentase'];
    
    // 3. Buat Data Rows (Group by VoicePart)
    const rows: string[][] = [];
    const voiceOrder = [VoicePart.SOPRAN, VoicePart.ALTO, VoicePart.TENOR, VoicePart.BASS];
    
    voiceOrder.forEach(part => {
        // Header Kategori Suara
        rows.push([`--- ${part.toUpperCase()} ---`, ...Array(dateHeaders.length + 1).fill('')]);

        const usersInPart = state.users
            .filter(u => u.status === UserStatus.ACTIVE && u.voicePart === part)
            .sort((a, b) => a.name.localeCompare(b.name));
            
        usersInPart.forEach((user, idx) => {
            const attendanceStatus = eventsInRange.map(ev => {
                const att = state.attendance.find(a => a.eventId === ev.id && a.userId === user.id);
                if (att?.status === 'present') return 'v'; // Hadir = Centang
                if (att?.status === 'absent') return 'I';  // Izin = I
                return '-';                                // Tidak polling = -
            });
            
            // Hitung Persentase Berdasarkan Range
            const presentCount = eventsInRange.filter(ev => {
                 const att = state.attendance.find(a => a.eventId === ev.id && a.userId === user.id);
                 return att?.status === 'present';
            }).length;
            const percent = Math.round((presentCount / eventsInRange.length) * 100) + '%';
            
            // Format: 1. Nama
            rows.push([`${idx + 1}. ${user.name}`, ...attendanceStatus, percent]);
        });
        
        // Jarak antar kategori
        rows.push([]);
    });

    // 4. Generate & Download CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const voiceStyles = {
    [VoicePart.SOPRAN]: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    [VoicePart.ALTO]: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    [VoicePart.TENOR]: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    [VoicePart.BASS]: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  };

  // Helper untuk mendapatkan pesan konfirmasi yang aman
  const getConfirmationMessage = () => {
    if (!memberToAction) return "";
    const { users, action } = memberToAction;
    if (users.length > 1) {
      return `${users.length} anggota akan ${action === 'delete' ? 'dihapus' : 'direset'}. Lanjutkan?`;
    }
    return `Anggota "${users[0]?.name || 'Terpilih'}" akan ${action === 'delete' ? 'dihapus' : 'direset'}. Lanjutkan?`;
  };

  // Helper untuk warna card riwayat
  const getHistoryCardStyle = (percent: number) => {
    if (percent === 100) return "bg-gradient-to-br from-emerald-500 to-green-600 shadow-green-200";
    if (percent < 50) return "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200";
    if (percent < 80) return "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200";
    return "bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-200";
  };

  return (
    <div className="pb-32 lg:pb-8 bg-slate-50 min-h-screen">
      {/* Action Bar (Bulk) */}
      {selectedUserIds.size > 0 && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-2xl animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 text-white rounded-[24px] shadow-2xl p-4 flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-4 ml-2">
              <span className="bg-purple-600 px-3 py-1 rounded-lg font-black text-xs">{selectedUserIds.size}</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Terpilih</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMemberToAction({ users: state.users.filter(u => selectedUserIds.has(u.id)), action: 'reset' })} className="px-4 py-2.5 bg-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Key size={14} /> Reset</button>
              <button onClick={() => setMemberToAction({ users: state.users.filter(u => selectedUserIds.has(u.id)), action: 'delete' })} className="px-4 py-2.5 bg-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Trash2 size={14} /> Hapus</button>
              <button onClick={() => setSelectedUserIds(new Set())} className="p-2.5 bg-white/10 rounded-xl"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky lg:static top-0 z-40 bg-white/95 border-b border-purple-100 p-6 lg:bg-transparent lg:border-none">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 text-purple-600 bg-white rounded-xl border border-purple-100 shadow-sm"><ArrowLeft size={18} strokeWidth={3} /></button>
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">Manajemen Anggota</h2>
          </div>
          <button onClick={() => setIsRegisterModalOpen(true)} className="p-3 bg-purple-600 text-white rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">
            <UserPlus size={16} strokeWidth={3} /> <span className="hidden lg:inline ml-2">Tambah Anggota</span>
          </button>
        </div>
      </div>

      <main className="px-6 py-6 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-purple-50 p-5 rounded-[24px] border border-white shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-purple-600 text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1">Total</span>
            <span className="text-purple-600 text-2xl lg:text-3xl font-black">{stats.total}</span>
          </div>
          {(Object.entries(voiceStyles) as [VoicePart, typeof voiceStyles[VoicePart]][]).map(([part, style]) => (
            <div key={part} className={`${style.bg} p-5 rounded-[24px] border border-white shadow-sm flex flex-col items-center justify-center text-center`}>
              <span className={`${style.color} text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1`}>{part === VoicePart.SOPRAN ? 'Sopran' : part}</span>
              <span className={`${style.color} text-2xl lg:text-3xl font-black`}>{stats[part === VoicePart.SOPRAN ? 'sopran' : part.toLowerCase() as keyof typeof stats] || 0}</span>
            </div>
          ))}
        </div>

        <section className={`bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden ${pendingUsers.length === 0 ? 'opacity-70' : ''}`}>
          <div onClick={() => setIsPendingExpanded(!isPendingExpanded)} 
            className="w-full p-6 lg:p-8 flex items-center justify-between bg-amber-50/50 hover:bg-amber-100/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm"><Users size={24} /></div>
              <div className="text-left">
                <h3 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight leading-none">Persetujuan</h3>
                <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase mt-2 tracking-widest">{pendingUsers.length} Permintaan</p>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 transition-transform ${isPendingExpanded ? 'rotate-180' : ''}`}>
               <ChevronDown size={24} />
            </div>
          </div>
          {isPendingExpanded && (
            <div className="p-6 lg:p-8 border-t border-slate-50 space-y-3 bg-white">
              {pendingUsers.length > 0 ? pendingUsers.map(user => (
                <div key={user.id} className="bg-slate-50 border border-slate-100 p-4 lg:p-6 rounded-3xl flex items-center justify-between">
                  <div>
                    <p className="text-[13px] lg:text-lg font-black text-slate-900">{user.name}</p>
                    <p className="text-[9px] lg:text-xs font-bold text-slate-400 uppercase">{user.voicePart} • {user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveUser(user.id)} className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"><Check size={20} strokeWidth={3} /></button>
                    <button onClick={() => setMemberToAction({users: [user], action: 'delete'})} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"><Trash2 size={20} /></button>
                  </div>
                </div>
              )) : <p className="text-center py-8 text-slate-300 text-[10px] font-black uppercase tracking-widest">Tidak ada permintaan</p>}
            </div>
          )}
        </section>

        <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div onClick={() => setIsActiveExpanded(!isActiveExpanded)} 
            className="w-full p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0"><Music size={24} /></div>
              <div className="text-left">
                <h3 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight leading-none">Anggota Aktif / Persentasi Kehadiran</h3>
                <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase mt-2 tracking-widest">{stats.total} Member</p>
              </div>
            </div>
             
             {/* Date Picker Controls for Export */}
             <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto mt-3 lg:mt-0" onClick={(e) => e.stopPropagation()}>
               <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl p-1.5 shadow-sm w-full lg:w-auto justify-between">
                 <input 
                   type="date"
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="flex-1 min-w-0 bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none"
                 />
                 <span className="text-slate-300 font-bold">-</span>
                 <input 
                   type="date"
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="flex-1 min-w-0 bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-600 outline-none text-right lg:text-left"
                 />
               </div>

               <div className="flex items-center gap-2">
                 <button 
                  onClick={handleExportCSV}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95 shrink-0 h-10 lg:h-auto"
                 >
                   <Download size={14} /> <span>CSV</span>
                 </button>
                 <div 
                   onClick={() => setIsActiveExpanded(!isActiveExpanded)}
                   className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 transition-transform shrink-0 cursor-pointer ${isActiveExpanded ? 'rotate-180' : ''}`}
                 >
                   <ChevronDown size={24} />
                 </div>
               </div>
             </div>
          </div>
          
          {isActiveExpanded && (
            <div className="p-6 lg:p-8 border-t border-slate-50 space-y-8 bg-white">
              <div className="relative mt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input type="text" placeholder="Cari anggota..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 lg:py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm lg:text-base shadow-inner outline-none focus:ring-4 focus:ring-purple-500/10 transition-all" />
              </div>

              <div className="space-y-10">
                {(Object.entries(groupedUsers) as [VoicePart, User[]][]).map(([part, users]) => {
                  // Menyembunyikan kategori yang kosong jika sedang melakukan pencarian
                  if (userSearchQuery && users.length === 0) return null;

                  return (
                    <div key={part} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-xl ${voiceStyles[part].bg} ${voiceStyles[part].color} text-[11px] lg:text-sm font-black uppercase tracking-widest border ${voiceStyles[part].border}`}>
                          {part === VoicePart.SOPRAN ? 'Sopran' : part} : {users.length}
                        </div>
                        <div className="h-px flex-1 bg-slate-100"></div>
                      </div>
                      <div className="space-y-3">
                        {users.length > 0 ? users.map((user, idx) => {
                          const isSelected = selectedUserIds.has(user.id);
                          const attendancePercent = monthlyStats.getUserPercent(user.id);
                          
                          return (
                            <div 
                              key={user.id} 
                              onClick={() => setSelectedMemberForHistory(user)} // Click to show history modal
                              className={`flex flex-col lg:flex-row lg:items-center p-4 lg:p-6 rounded-3xl border transition-all duration-200 cursor-pointer gap-4 lg:gap-0 ${
                                isSelected 
                                  ? 'bg-purple-50 border-purple-200' 
                                  : 'bg-slate-50 border-slate-200 hover:border-purple-300 hover:shadow-md'
                              }`}
                            >
                              {/* Top Section: Checkbox + Info */}
                              <div className="flex items-center w-full lg:w-auto min-w-0 gap-4 lg:gap-6 flex-1">
                                  <button onClick={(e) => toggleSelectUser(user.id, e)} className={`shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-300 hover:text-slate-400'}`}>
                                    {isSelected ? <CheckSquare size={24} strokeWidth={2.5} /> : <Square size={24} />}
                                  </button>
                                  
                                  <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
                                    <span className="text-[10px] lg:text-base font-black text-slate-300 w-5 lg:w-8 shrink-0">{idx + 1}.</span>
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center font-black text-[12px] lg:text-base shrink-0 shadow-sm ${isSelected ? 'bg-purple-600 text-white' : `${voiceStyles[part].bg} ${voiceStyles[part].color}`}`}>
                                      {user.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[13px] lg:text-lg font-black text-slate-900 leading-tight truncate">{user.name}</p>
                                      <p className="text-[10px] lg:text-sm font-bold text-slate-400 uppercase truncate mt-0.5">{user.email}</p>
                                    </div>
                                  </div>
                              </div>

                              {/* Bottom/Right Section: Stats & Actions */}
                              <div className="flex items-center justify-between w-full lg:w-auto lg:gap-8 pl-[60px] lg:pl-0">
                                {/* Percentage */}
                                <div className="flex items-center gap-2 lg:flex-col lg:items-center lg:justify-center lg:w-24">
                                  <span className="lg:hidden text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hadir:</span>
                                  <span className={`text-lg lg:text-3xl font-black ${
                                    attendancePercent === 100 ? 'text-green-600' : 
                                    attendancePercent < 50 ? 'text-red-500' : 'text-purple-600'
                                  }`}>
                                    {attendancePercent}%
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 lg:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => setUserToEdit(user)} className="p-2 lg:p-2.5 bg-white border border-slate-100 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"><Edit2 size={18} /></button>
                                  <button onClick={() => setMemberToAction({users: [user], action: 'reset'})} className="p-2 lg:p-2.5 bg-white border border-slate-100 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm"><Key size={18} /></button>
                                  <button onClick={() => setMemberToAction({users: [user], action: 'delete'})} className="p-2 lg:p-2.5 bg-white border border-slate-100 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"><Trash2 size={18} /></button>
                                </div>
                              </div>
                            </div>
                          );
                        }) : <p className="text-[12px] text-slate-300 italic pl-8">Tidak ada data anggota</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MEMBER HISTORY MODAL (BULAN INI) */}
      {selectedMemberForHistory && historyData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedMemberForHistory(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedMemberForHistory.name}</h3>
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mt-0.5">
                   Riwayat {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelectedMemberForHistory(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors bg-slate-50 rounded-full">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Stats Card */}
            <div className={`${getHistoryCardStyle(historyData.stats.percentage)} text-white p-5 rounded-2xl mb-6 flex items-center justify-between shadow-xl relative overflow-hidden transition-all duration-500`}>
               <div className="relative z-10">
                   <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold">Persentase</p>
                   <p className="text-4xl font-black mt-1">{historyData.stats.percentage}%</p>
               </div>
               <div className="text-right relative z-10">
                   <p className="text-[9px] opacity-80 uppercase tracking-widest font-bold">Kehadiran</p>
                   <p className="text-lg font-black mt-1">{historyData.stats.present} / {historyData.stats.total}</p>
               </div>
               <Activity className="absolute -right-4 -bottom-4 text-white/10" size={100} />
            </div>

            {/* List */}
            <div className="space-y-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-y-auto custom-scrollbar flex-1">
                {historyData.events.length > 0 ? (
                  historyData.events.map(ev => {
                    const dateStr = new Date(ev.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
                    const isPresent = ev.status === 'present';
                    
                    const textColor = isPresent ? 'text-green-600' : 'text-red-500';
                    const Icon = isPresent ? Check : X;

                    return (
                       <div key={ev.id} className={`flex items-start gap-2 text-[12px] font-bold ${textColor} leading-relaxed`}>
                          <Icon size={14} strokeWidth={3} className="mt-0.5 shrink-0" />
                          <span>{dateStr}, {ev.category} {ev.location}</span>
                       </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4">
                     <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tidak ada kegiatan bulan ini</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {memberToAction && (
        <ConfirmationModal 
          isOpen={true} 
          onClose={() => setMemberToAction(null)} 
          onConfirm={executeAction}
          title={memberToAction.action === 'delete' ? 'Konfirmasi Hapus' : 'Konfirmasi Reset'}
          message={getConfirmationMessage()}
          confirmText={memberToAction.action === 'delete' ? 'Hapus' : 'Reset'}
        />
      )}

      {userToEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setUserToEdit(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 lg:p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ubah Anggota</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Update Data Profile Member</p>
              </div>
              <button onClick={() => setUserToEdit(null)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input required type="text" value={userToEdit.name} onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required type="email" value={userToEdit.email} onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })} 
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required type="tel" value={userToEdit.phone} onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })} 
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Suara</label>
                  <select value={userToEdit.voicePart} onChange={(e) => setUserToEdit({ ...userToEdit, voicePart: e.target.value as VoicePart })} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all">
                    {Object.values(VoicePart).map(p => <option key={p} value={p}>{p === VoicePart.SOPRAN ? 'Sopran' : p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select value={userToEdit.role} onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as UserRole })} 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all">
                    <option value={UserRole.USER}>User</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.KOORDI}>Koordi</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setUserToEdit(null)} 
                  className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                  Batal
                </button>
                <button type="submit" 
                  className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100 active:scale-95 transition-all border border-purple-500">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessReset && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSuccessReset(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-[28px] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Berhasil Update!</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed mb-8">Data anggota telah diperbarui di database Voice of Soul.</p>
            <button onClick={() => setShowUpdateSuccess(false)} 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-100">
              Tutup
            </button>
          </div>
        </div>
      )}

      {showSuccessReset && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSuccessReset(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-2xl">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-black mb-2">Berhasil!</h3>
            <p className="text-sm text-slate-500 mb-8">Sandi direset menjadi "123456".</p>
            <button onClick={() => setShowSuccessReset(false)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase">Tutup</button>
          </div>
        </div>
      )}
      <RegisterUserModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onSubmit={registerUser} />
    </div>
  );
};