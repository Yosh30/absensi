import React, { useState, useMemo } from 'react';
import { X, MapPin, Calendar, Clock, CheckCircle, XCircle, Share2, Info, Users, ChevronDown, Music, Plus, Search, ChevronLeft, Send, Loader2, Trash2, HelpCircle, AlertTriangle } from 'lucide-react';
import { ChoirEvent, Attendance, UserRole, VoicePart, UserStatus, User } from '../types';
import { useApp } from '../App';

interface EventDetailModalProps {
  event: ChoirEvent | null;
  onClose: () => void;
  currentStatus?: Attendance;
  onPresent?: (eventId: string) => void;
  onAbsent?: (eventId: string) => void;
}

interface VoiceGroupData {
  present: { id: string; name: string }[];
  absent: { id: string; name: string; reason: string }[];
  pending: { id: string; name: string }[];
}

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  userName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 p-8 text-center">
        <div className={`w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Hapus Status?</h3>
        <p className="text-slate-500 text-[13px] leading-relaxed mb-8">
          Apakah Anda yakin ingin mereset status kehadiran <span className="font-black text-slate-900">"{userName}"</span> menjadi "Belum Polling"?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-[2] bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-red-100 border border-red-500`}
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  event, 
  onClose, 
  currentStatus,
  onPresent,
  onAbsent
}) => {
  const { state, adminSubmitAttendance, adminRemoveAttendance } = useApp();
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingReasonUserId, setAddingReasonUserId] = useState<string | null>(null);
  const [manualReason, setManualReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  const togglePart = (part: string) => {
    const newSet = new Set(expandedParts);
    if (newSet.has(part)) {
      newSet.delete(part);
    } else {
      newSet.add(part);
    }
    setExpandedParts(newSet);
  };

  const attendanceData = useMemo(() => {
    if (!event) return null;

    const groups: Record<string, VoiceGroupData> = {
      [VoicePart.SOPRAN]: { present: [], absent: [], pending: [] },
      [VoicePart.ALTO]: { present: [], absent: [], pending: [] },
      [VoicePart.TENOR]: { present: [], absent: [], pending: [] },
      [VoicePart.BASS]: { present: [], absent: [], pending: [] },
    };

    const eventAttendance = state.attendance.filter(a => a.eventId === event.id);
    const attendanceMap = new Map<string, Attendance>(eventAttendance.map(a => [a.userId, a]));

    state.users.filter(u => u.status === UserStatus.ACTIVE).forEach(user => {
      const group = groups[user.voicePart];
      if (!group) return;

      const att = attendanceMap.get(user.id);
      if (!att) {
        group.pending.push({ id: user.id, name: user.name });
      } else if (att.status === 'present') {
        group.present.push({ id: user.id, name: user.name });
      } else if (att.status === 'absent') {
        group.absent.push({ id: user.id, name: user.name, reason: att.reason || 'Tanpa alasan' });
      }
    });

    return groups;
  }, [event, state.users, state.attendance]);

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;
  const isKoordi = state.currentUser?.role === UserRole.KOORDI;
  const canManage = isAdmin || isKoordi;

  const canManagePart = (part: string) => {
    if (isAdmin) return true;
    if (isKoordi && state.currentUser?.voicePart === part) return true;
    return false;
  };

  const unrecordedUsers = useMemo(() => {
    if (!event || !canManage) return [];
    const recordedIds = new Set(state.attendance.filter(a => a.eventId === event.id).map(a => a.userId));
    return state.users
      .filter(u => u.status === UserStatus.ACTIVE && !recordedIds.has(u.id))
      .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
      // Koordi hanya bisa melihat anggota yang suaranya sama dengan dirinya untuk dikelola
      .filter(u => isAdmin || (isKoordi && u.voicePart === state.currentUser?.voicePart))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [event, state.users, state.attendance, canManage, isAdmin, isKoordi, state.currentUser, searchQuery]);

  if (!event) return null;

  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  
  const totalPresentOverall = state.attendance.filter(a => a.eventId === event.id && a.status === 'present').length;
  const totalAbsentOverall = state.attendance.filter(a => a.eventId === event.id && a.status === 'absent').length;

  const voiceParts = [
    { id: VoicePart.SOPRAN, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { id: VoicePart.ALTO, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { id: VoicePart.TENOR, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: VoicePart.BASS, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  const shareToWhatsApp = () => {
    let message = `*VOS - JADWAL KEGIATAN*\n` +
      `--------------------------\n` +
      `*Kegiatan:* ${event.title}\n` +
      `*Waktu:* ${dayName}, ${dateStr} @ ${timeStr}\n` +
      `*Lokasi:* ${event.location}\n\n`;

    if (attendanceData) {
      if (isAdmin) {
          // Admin Shares All
          message += `*DAFTAR KEHADIRAN (SATB)*\n`;
          message += `\n✅ *HADIR (${totalPresentOverall}):*\n`;
          voiceParts.forEach(part => {
            const pList = attendanceData[part.id].present;
            if (pList.length > 0) {
              message += `_${part.id}_: ${pList.map(u => u.name).join(', ')}\n`;
            }
          });

          if (totalAbsentOverall > 0) {
            message += `\n❌ *IZIN (${totalAbsentOverall}):*\n`;
            voiceParts.forEach(part => {
              const aList = attendanceData[part.id].absent;
              if (aList.length > 0) {
                message += `_${part.id}_: ${aList.map(u => `${u.name} (${u.reason})`).join(', ')}\n`;
              }
            });
          }
      } else if (isKoordi && state.currentUser) {
          // Koordi Shares Only Their Part
          const myPart = state.currentUser.voicePart;
          const myData = attendanceData[myPart];
          
          message += `*DAFTAR KEHADIRAN ${myPart.toUpperCase()}*\n`;
          message += `\n✅ *HADIR (${myData.present.length}):*\n`;
          if (myData.present.length > 0) {
              message += myData.present.map(u => u.name).join(', ') + '\n';
          } else {
              message += `-\n`;
          }

          if (myData.absent.length > 0) {
              message += `\n❌ *IZIN (${myData.absent.length}):*\n`;
              message += myData.absent.map(u => `${u.name} (${u.reason})`).join(', ') + '\n';
          }
          
          if (myData.pending.length > 0) {
             message += `\n⏳ *BELUM POLLING (${myData.pending.length}):*\n`;
             message += myData.pending.map(u => u.name).join(', ') + '\n';
          }
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleManualAddPresent = async (userId: string) => {
    setIsProcessing(userId);
    try {
      await adminSubmitAttendance(userId, event.id, 'present');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleManualAddAbsent = async (userId: string) => {
    if (!manualReason.trim()) {
      alert("Alasan harus diisi untuk izin.");
      return;
    }
    setIsProcessing(userId);
    try {
      await adminSubmitAttendance(userId, event.id, 'absent', manualReason);
      setAddingReasonUserId(null);
      setManualReason('');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsProcessing(userToDelete.id);
    try {
      await adminRemoveAttendance(userToDelete.id, event.id);
    } catch (error) {
      alert('Gagal menghapus data kehadiran.');
    } finally {
      setIsProcessing(null);
      setUserToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md md:max-w-4xl bg-white rounded-t-3xl sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in slide-in-from-bottom duration-300 max-h-[92vh]">
        {/* Compact Header Modal */}
        <div className="relative pt-6 px-5 pb-2 border-b border-slate-50 shrink-0">
          <button onClick={onClose} className="absolute right-4 top-4 p-1.5 bg-slate-50 text-slate-300 hover:text-purple-600 rounded-full transition-all active:scale-90 z-10">
            <X size={20} strokeWidth={2.5} />
          </button>
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] md:text-[12px] font-black uppercase tracking-widest bg-purple-50 text-purple-600">
                {event.category}
              </span>
              <p className="text-[10px] md:text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">Detail</p>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">{event.title}</h3>
          </div>
        </div>

        {/* Compact Scrollable Content */}
        <div className="px-4 py-5 md:px-10 md:py-8 space-y-5 overflow-y-auto custom-scrollbar bg-white flex-1">
          
          {!isAddingMember ? (
            <>
              {/* Event Info Card */}
              <div className="bg-slate-50 rounded-[24px] border border-slate-100 px-5 py-5 md:p-6 space-y-5">
                {event.description && (
                  <div className="space-y-1">
                    <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Info size={14} /> Keterangan
                    </p>
                    <p className="text-[13px] md:text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}

                <div className="h-px bg-slate-200 w-full" />

                <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Tanggal</p>
                      <p className="text-slate-900 font-bold text-[13px] md:text-[15px] leading-none">{dayName}, {dateStr}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Waktu</p>
                      <p className="text-slate-900 font-bold text-[13px] md:text-[15px] leading-none">{timeStr}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Lokasi</p>
                      <p className="text-slate-900 font-bold text-[13px] md:text-[15px] leading-tight break-words">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SATB Accordion */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[11px] md:text-[13px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                    <Users size={14} /> Kehadiran SATB
                  </h4>
                  <span className="text-[11px] md:text-[13px] font-black text-slate-900 uppercase">{totalPresentOverall} Hadir</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                  {voiceParts.map((part) => {
                    const isOpen = expandedParts.has(part.id);
                    const data = attendanceData?.[part.id];
                    const isManageable = canManagePart(part.id);
                    
                    return (
                      <div key={part.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col transition-all shadow-sm">
                        <button 
                          onClick={() => togglePart(part.id)}
                          className="w-full px-4 py-3 md:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white border-b border-slate-50"
                        >
                          <div className={`flex items-center gap-2 font-black text-[13px] md:text-[15px] uppercase tracking-wider ${part.color}`}>
                            <Music size={14} className="md:w-4 md:h-4" />
                            {part.id}
                            <span className="ml-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 text-slate-500 text-[10px] md:text-[12px] font-black">
                              {data?.present.length || 0}
                            </span>
                          </div>
                          <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isOpen && data && (
                          <div className="p-4 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-slate-50/40">
                            {/* Hadir Section */}
                            <div className="space-y-1.5">
                              <p className="text-[10px] md:text-[12px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                <CheckCircle size={10} /> Hadir
                              </p>
                              <div className="space-y-1 pl-1">
                                {data.present.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-1">
                                    {data.present.map((u, i) => (
                                      <div key={u.id} className="flex items-center justify-between group/user py-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] md:text-[14px] font-bold text-slate-700">{i + 1}. {u.name}</p>
                                        </div>
                                        {isManageable && (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setUserToDelete({ id: u.id, name: u.name });
                                            }}
                                            disabled={isProcessing === u.id}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors -mr-2"
                                            title="Hapus / Reset"
                                          >
                                            {isProcessing === u.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-[11px] md:text-[13px] text-slate-300 italic">Kosong</p>}
                              </div>
                            </div>

                            {/* Izin Section */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                              <p className="text-[10px] md:text-[12px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                <XCircle size={10} /> Izin
                              </p>
                              <div className="space-y-2 pl-1">
                                {data.absent.length > 0 ? data.absent.map((u, i) => (
                                  <div key={u.id} className="flex items-center justify-between group/user py-0.5">
                                    <div className="flex-1 pr-2 min-w-0 flex items-start gap-2">
                                      <div>
                                        <p className="text-[13px] md:text-[14px] font-bold text-slate-700 leading-none truncate">{i + 1}. {u.name}</p>
                                        <p className="text-[11px] md:text-[13px] text-slate-500 font-medium italic leading-tight mt-1 truncate">"{u.reason}"</p>
                                      </div>
                                    </div>
                                    {isManageable && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setUserToDelete({ id: u.id, name: u.name });
                                        }}
                                        disabled={isProcessing === u.id}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors -mr-2"
                                        title="Hapus / Reset"
                                      >
                                        {isProcessing === u.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                      </button>
                                    )}
                                  </div>
                                )) : <p className="text-[11px] md:text-[13px] text-slate-300 italic">Tidak ada</p>}
                              </div>
                            </div>

                            {/* Belum Polling Section */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                              <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <HelpCircle size={10} /> Belum Polling
                              </p>
                              <div className="space-y-1 pl-1">
                                {data.pending.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-1">
                                    {data.pending.map((u, i) => (
                                      <div key={u.id} className="flex items-center justify-between group/user py-0.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0 mt-1" />
                                            <p className="text-[13px] md:text-[14px] font-bold text-slate-400 opacity-80">{i + 1}. {u.name}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-[11px] md:text-[13px] text-slate-300 italic">Semua sudah polling</p>}
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-3">
                <button onClick={() => { setIsAddingMember(false); setSearchQuery(''); setAddingReasonUserId(null); }} className="p-2 text-purple-600 bg-slate-50 border border-slate-100 rounded-xl">
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <div>
                  <h4 className="text-lg font-black text-slate-900 leading-none">Manajemen Manual</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pencatatan {isKoordi ? 'Koordi' : 'Admin'}</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari anggota..." 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-purple-500/10 transition-all shadow-inner"
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {unrecordedUsers.length > 0 ? (
                  unrecordedUsers.slice(0, 10).map(user => (
                    <div key={user.id} className="p-4 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black text-white shrink-0 ${
                            user.voicePart === VoicePart.SOPRAN ? 'bg-rose-500' :
                            user.voicePart === VoicePart.ALTO ? 'bg-amber-500' :
                            user.voicePart === VoicePart.TENOR ? 'bg-blue-500' :
                            'bg-emerald-500'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-black text-slate-900 truncate">{user.name}</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{user.voicePart}</p>
                          </div>
                        </div>

                        {addingReasonUserId !== user.id && (
                          <div className="flex gap-2">
                            <button 
                              disabled={isProcessing === user.id}
                              onClick={() => handleManualAddPresent(user.id)}
                              className="p-2 bg-green-50 text-green-600 rounded-xl border border-green-100 disabled:opacity-50"
                            >
                              {isProcessing === user.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} strokeWidth={2.5} />}
                            </button>
                            <button 
                              disabled={isProcessing === user.id}
                              onClick={() => setAddingReasonUserId(user.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100 disabled:opacity-50"
                            >
                              <XCircle size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>

                      {addingReasonUserId === user.id && (
                        <div className="mt-3 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                          <input 
                            type="text"
                            placeholder="Alasan izin..."
                            value={manualReason}
                            autoFocus
                            onChange={(e) => setManualReason(e.target.value)}
                            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && handleManualAddAbsent(user.id)}
                          />
                          <button 
                            disabled={isProcessing === user.id}
                            onClick={() => handleManualAddAbsent(user.id)} 
                            className="p-3 bg-red-600 text-white rounded-xl flex items-center justify-center min-w-[42px]"
                          >
                            {isProcessing === user.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                          <button onClick={() => { setAddingReasonUserId(null); setManualReason(''); }} className="p-3 bg-slate-100 text-slate-400 rounded-xl"><X size={16} /></button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tidak ada data</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer Actions */}
        <div className="px-4 pb-6 pt-2 border-t border-slate-50 bg-slate-50/20 shrink-0 space-y-3">
          {!isAddingMember && (
            <div className="max-w-sm mx-auto">
              <p className="text-center text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Status Kehadiran Saya</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onPresent?.(event.id)} 
                  className={`py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all border-2 ${
                    currentStatus?.status === 'present' 
                      ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' 
                      : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle size={16} strokeWidth={2.5} /> Hadir
                </button>
                <button 
                  onClick={() => onAbsent?.(event.id)} 
                  className={`py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all border-2 ${
                    currentStatus?.status === 'absent' 
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' 
                      : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  <XCircle size={16} strokeWidth={2.5} /> Izin
                </button>
              </div>
            </div>
          )}

          {canManage && !isAddingMember && (
            <div className="pt-2 border-t border-slate-100 flex gap-3 max-w-sm mx-auto">
              <button 
                onClick={shareToWhatsApp} 
                className="flex-[1] py-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <Share2 size={16} strokeWidth={2.5} /> Share
              </button>
              <button 
                onClick={() => setIsAddingMember(true)}
                className="flex-[2] py-3.5 bg-purple-600 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={3} /> Kelola SATB
              </button>
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmModal 
        isOpen={!!userToDelete} 
        onClose={() => setUserToDelete(null)} 
        onConfirm={handleConfirmDelete} 
        userName={userToDelete?.name || ''} 
      />
    </div>
  );
};