
import React, { useState, useMemo } from 'react';
import { X, MapPin, Calendar, Clock, Users, Music, UserPlus, Search, CheckCircle, Plus, ChevronRight } from 'lucide-react';
import { ChoirEvent, VoicePart, Attendance, User } from '../types';
import { useApp } from '../App';

interface AdminMonitorModalProps {
  event: ChoirEvent | null;
  onClose: () => void;
  attendance: Attendance[];
  users: User[];
}

export const AdminMonitorModal: React.FC<AdminMonitorModalProps> = ({ event, onClose, attendance, users }) => {
  const { adminSubmitAttendance } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!event) return null;

  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const currentAttendance = attendance.filter(a => a.eventId === event.id);
  const presentAttendance = currentAttendance.filter(a => a.status === 'present');
  const presentUsers = presentAttendance.map(att => users.find(u => u.id === att.userId)).filter(Boolean) as User[];

  const composition = {
    [VoicePart.SOPRAN]: presentUsers.filter(u => u.voicePart === VoicePart.SOPRAN),
    [VoicePart.ALTO]: presentUsers.filter(u => u.voicePart === VoicePart.ALTO),
    [VoicePart.TENOR]: presentUsers.filter(u => u.voicePart === VoicePart.TENOR),
    [VoicePart.BASS]: presentUsers.filter(u => u.voicePart === VoicePart.BASS),
  };

  const totalPresent = presentUsers.length;

  // Anggota yang belum absen di acara ini
  const unrecordedUsers = useMemo(() => {
    const recordedIds = new Set(currentAttendance.map(a => a.userId));
    return users.filter(u => !recordedIds.has(u.id))
      .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.voicePart.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, currentAttendance, searchQuery]);

  const handleManualAdd = (userId: string) => {
    adminSubmitAttendance(userId, event.id, 'present');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-purple-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight truncate max-w-[200px]">{event.title}</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Monitoring Kehadiran</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-slate-50/30">
          {!showAddUser ? (
            <>
              <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Hari & Tanggal</p>
                    <p className="text-[12px] font-bold text-slate-700">{dayName}, {dateStr}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Total Hadir</p>
                  <p className="text-[18px] font-black text-purple-600">{totalPresent}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Komposisi SATB</h4>
                  <button 
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-100 active:scale-95 transition-all"
                  >
                    <Plus size={12} strokeWidth={3} /> Tambah Anggota
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: VoicePart.SOPRAN, list: composition[VoicePart.SOPRAN], color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                    { label: VoicePart.ALTO, list: composition[VoicePart.ALTO], color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: VoicePart.TENOR, list: composition[VoicePart.TENOR], color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: VoicePart.BASS, list: composition[VoicePart.BASS], color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} ${item.border} p-4 rounded-2xl border shadow-sm`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${item.color}`}>{item.label === VoicePart.SOPRAN ? 'Sopran' : item.label}</span>
                        <span className={`text-xl font-black ${item.color}`}>{item.list.length}</span>
                      </div>
                      <div className="h-1 w-full bg-white/50 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color.replace('text', 'bg')} opacity-40`} style={{ width: `${(item.list.length / Math.max(users.length / 4, 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Daftar Kehadiran Saat Ini</h4>
                 <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-sm">
                   {presentUsers.length > 0 ? (
                     presentUsers.map(user => (
                       <div key={user.id} className="p-3 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                             {user.name.charAt(0)}
                           </div>
                           <div>
                             <p className="text-[11px] font-bold text-slate-700">{user.name}</p>
                             <p className="text-[8px] font-black text-purple-400 uppercase tracking-tighter">{user.voicePart === VoicePart.SOPRAN ? 'Sopran' : user.voicePart}</p>
                           </div>
                         </div>
                         <CheckCircle className="text-green-500" size={16} />
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center">
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Belum ada anggota hadir</p>
                     </div>
                   )}
                 </div>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-4">
                <button onClick={() => { setShowAddUser(false); setSearchQuery(''); }} className="p-2 text-purple-600 bg-white border border-purple-100 rounded-xl shadow-sm">
                  <ChevronRight className="rotate-180" size={18} strokeWidth={3} />
                </button>
                <div>
                  <h4 className="text-[13px] font-black text-slate-900 leading-tight">Tambah Anggota</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Pilih anggota ke agenda ini</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari nama anggota..." 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
                />
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {unrecordedUsers.length > 0 ? (
                  unrecordedUsers.map(user => (
                    <button 
                      key={user.id} 
                      onClick={() => handleManualAdd(user.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black group-hover:bg-purple-600 group-hover:text-white transition-all">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900">{user.name}</p>
                          <p className={`text-[8px] font-black uppercase tracking-widest ${
                            user.voicePart === VoicePart.SOPRAN ? 'text-rose-500' :
                            user.voicePart === VoicePart.ALTO ? 'text-amber-500' :
                            user.voicePart === VoicePart.TENOR ? 'text-blue-500' :
                            'text-emerald-500'
                          }`}>
                            {user.voicePart === VoicePart.SOPRAN ? 'Sopran' : user.voicePart}
                          </p>
                        </div>
                      </div>
                      <Plus size={18} className="text-slate-200 group-hover:text-purple-600 transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Semua anggota sudah terdata</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white border-t border-slate-50">
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-slate-100">
            Selesai Monitoring
          </button>
        </div>
      </div>
    </div>
  );
};
