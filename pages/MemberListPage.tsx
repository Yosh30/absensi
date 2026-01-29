
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Users, Search, ChevronRight, Phone, Mail, Edit2, X, Shield, Music, Key, Loader2, CheckCircle2, Smartphone, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { VoicePart, User, UserRole, UserStatus } from '../types';

export const MemberListPage = () => {
  const { state, updateUser, resetUserPassword } = useApp();
  const navigate = useNavigate();
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Statistik Anggota
  const stats = useMemo(() => {
    return {
      total: state.users.length,
      sopran: state.users.filter(u => u.voicePart === VoicePart.SOPRAN).length,
      alto: state.users.filter(u => u.voicePart === VoicePart.ALTO).length,
      tenor: state.users.filter(u => u.voicePart === VoicePart.TENOR).length,
      bass: state.users.filter(u => u.voicePart === VoicePart.BASS).length,
    };
  }, [state.users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return state.users.filter(u => 
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.voicePart.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.users, userSearchQuery]);

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateUser(selectedUser.id, selectedUser);
      setIsEditing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Reset password ${selectedUser.name} menjadi "123456"?`)) return;

    setIsResetting(true);
    try {
      await resetUserPassword(selectedUser.id);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      alert("Gagal mereset password. Silakan coba lagi.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="sticky lg:static top-0 z-40 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-none border-purple-100 shadow-sm lg:shadow-none">
        <div className="pt-5 pb-4 px-6 lg:px-0 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-purple-600 bg-white rounded-xl shadow-sm border border-purple-100 active:scale-95 transition-all">
            <ArrowLeft size={18} strokeWidth={3} />
          </button>
          <div>
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Anggota VOS</h2>
            <p className="text-purple-600/60 text-[8px] lg:text-[11px] font-black tracking-[0.2em] mt-0.5 uppercase">Data & Statistik Member</p>
          </div>
        </div>
      </div>

      <main className="px-6 lg:px-0 py-6 space-y-10">
        {stats.total > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between px-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ringkasan Suara</h4>
              <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase tracking-wider">Total: {stats.total}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { part: 'Sopran', count: stats.sopran, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
                { part: 'Alto', count: stats.alto, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
                { part: 'Tenor', count: stats.tenor, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                { part: 'Bass', count: stats.bass, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
              ].map((s) => (
                <div key={s.part} className={`${s.bg} ${s.border} border p-5 rounded-[24px] flex flex-col items-center justify-center text-center shadow-sm`}>
                  <span className={`${s.text} text-[9px] font-black uppercase tracking-widest mb-1`}>{s.part}</span>
                  <span className={`${s.text} text-2xl font-black`}>{s.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MEMBER LIST */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seluruh Anggota</h4>
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Cari anggota..." 
                value={userSearchQuery} 
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all" 
              />
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button 
                    key={user.id} 
                    onClick={() => { setSelectedUser(user); setIsEditing(false); }}
                    className="w-full p-4 lg:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-slate-900 truncate">{user.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            user.voicePart === VoicePart.SOPRAN ? 'bg-rose-50 text-rose-500' :
                            user.voicePart === VoicePart.ALTO ? 'bg-amber-50 text-amber-500' :
                            user.voicePart === VoicePart.TENOR ? 'bg-blue-50 text-blue-500' :
                            'bg-emerald-50 text-emerald-500'
                          }`}>
                            {user.voicePart}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 text-slate-300 group-hover:text-purple-600 transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Anggota tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* REFINED MEMBER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[95vh] border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 pb-2 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-lg ${
                  selectedUser.voicePart === VoicePart.SOPRAN ? 'bg-rose-500 text-white' :
                  selectedUser.voicePart === VoicePart.ALTO ? 'bg-amber-500 text-white' :
                  selectedUser.voicePart === VoicePart.TENOR ? 'bg-blue-500 text-white' :
                  'bg-emerald-500 text-white'
                }`}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight truncate leading-tight">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded tracking-widest">
                      ID: {selectedUser.id.slice(0, 8)}
                    </span>
                    <span className={`flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                      selectedUser.status === UserStatus.ACTIVE ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <Activity size={10} /> {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 pt-4 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Membership Info Cards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-purple-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Music size={12} className="text-purple-600" /> Section
                      </p>
                      <p className="text-[13px] font-black text-slate-800">{selectedUser.voicePart}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all hover:border-purple-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-purple-600" /> Role
                      </p>
                      <p className="text-[13px] font-black text-slate-800 uppercase tracking-tighter">{selectedUser.role}</p>
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kontak</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                      <div className="px-5 py-4 flex items-center gap-4 group">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-700 truncate">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="px-5 py-4 flex items-center gap-4 group">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <Smartphone size={16} />
                        </div>
                        <div className="min-w-0">
                          <a href={`tel:${selectedUser.phone}`} className="text-[13px] font-bold text-purple-600 hover:underline">{selectedUser.phone}</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Attendance Stats Placeholder */}
                  <div className="bg-purple-600 p-5 rounded-3xl text-white shadow-xl shadow-purple-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Kehadiran Rata-rata</p>
                      <p className="text-xl font-black mt-0.5">88.5%</p>
                    </div>
                    <Activity size={32} className="text-white/20" />
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                    >
                      <Edit2 size={16} /> Ubah
                    </button>

                    <button 
                      onClick={handleResetPassword}
                      disabled={isResetting || resetSuccess}
                      className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all border ${
                        resetSuccess 
                        ? 'bg-green-50 border-green-200 text-green-600' 
                        : 'bg-amber-50 border-amber-100 text-amber-600 hover:border-amber-400'
                      }`}
                    >
                      {isResetting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : resetSuccess ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Key size={14} />
                      )}
                      {resetSuccess ? 'Sandi Direset' : 'Reset Sandi'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input required type="text" value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input required type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bagian Suara</label>
                      <select value={selectedUser.voicePart} onChange={(e) => setSelectedUser({ ...selectedUser, voicePart: e.target.value as VoicePart })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs appearance-none">
                          <option value={VoicePart.SOPRAN}>Sopran</option>
                          <option value={VoicePart.ALTO}>Alto</option>
                          <option value={VoicePart.TENOR}>Tenor</option>
                          <option value={VoicePart.BASS}>Bass</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                      <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs appearance-none">
                          <option value={UserRole.USER}>User</option>
                          <option value={UserRole.ADMIN}>Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon</label>
                    <input required type="tel" value={selectedUser.phone} onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Batal
                    </button>
                    <button type="submit" className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100 active:scale-95 transition-all border border-purple-500">
                      Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
