
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronRight, Search, Check, X, Edit2, Users, Trash2, AlertTriangle, ArrowLeft, CheckCircle, XCircle, Filter, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../App';
import { EventDetailModal } from '../components/EventDetailModal';
import { EventFormModal } from '../components/CreateEventModal';
import { ReasonInputModal } from '../components/ReasonInputModal';
import { ChoirEvent, UserRole } from '../types';

type StatusFilter = 'upcoming' | 'all';
type VoteStatus = 'all' | 'voted' | 'not_voted';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  eventTitle: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 p-8 text-center">
        <div className={`w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Hapus Jadwal?</h3>
        <p className="text-slate-500 text-[13px] leading-relaxed mb-8">
          Apakah Anda yakin ingin menghapus <span className="font-black text-slate-900">"{eventTitle}"</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            Batal
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`flex-[2] bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-red-100 border border-red-500`}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export const SchedulePage = () => {
  const { state, updateEvent, deleteEvent, submitAttendance } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<ChoirEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChoirEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ChoirEvent | null>(null);
  const [absenceEventId, setAbsenceEventId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVoteStatus, setSelectedVoteStatus] = useState<VoteStatus>('all');

  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  const months = [
    { value: '0', label: 'Januari' }, { value: '1', label: 'Februari' }, { value: '2', label: 'Maret' },
    { value: '3', label: 'April' }, { value: '4', label: 'Mei' }, { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' }, { value: '7', label: 'Agustus' }, { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' }, { value: '10', label: 'November' }, { value: '11', label: 'Desember' }
  ];

  const handleEditSubmit = (data: Omit<ChoirEvent, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
        setEventToDelete(null);
      } catch (err) {
        alert('Gagal menghapus jadwal.');
      }
    }
  };

  const handlePresent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    submitAttendance(eventId, 'present');
  };

  const handleAbsent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAbsenceEventId(eventId);
  };

  const submitAbsentReason = (reason: string) => {
    if (absenceEventId) {
      submitAttendance(absenceEventId, 'absent', reason);
      setAbsenceEventId(null);
    }
  };

  const formatTimeOnly = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' });
  };

  const getDay = (dateStr: string) => new Date(dateStr).getDate();
  const getMonthLabel = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    return state.events
      .filter(event => {
        const eventDate = new Date(event.date);
        const eventTime = eventDate.getTime();
        
        const matchesStatus = statusFilter === 'all' ? true : eventTime > now - 86400000;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             event.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMonth = selectedMonth === 'all' ? true : eventDate.getMonth().toString() === selectedMonth;
        const matchesCategory = selectedCategory === 'all' ? true : event.category === selectedCategory;
        
        // Filter Voted
        const userAttendance = state.attendance.find(a => a.eventId === event.id && a.userId === state.currentUser?.id);
        const isConfirmed = !!userAttendance;
        const matchesVote = selectedVoteStatus === 'all' ? true : (selectedVoteStatus === 'voted' ? isConfirmed : !isConfirmed);
        
        return matchesStatus && matchesSearch && matchesMonth && matchesCategory && matchesVote;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [state.events, statusFilter, searchQuery, selectedMonth, selectedCategory, selectedVoteStatus, state.attendance, state.currentUser]);

  const currentStatusInModal = state.attendance.find(
    a => a.eventId === selectedEvent?.id && a.userId === state.currentUser?.id
  );

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      <div className="sticky lg:static top-0 z-40 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-none border-purple-100 shadow-sm lg:shadow-none">
        <div className="pt-5 pb-4 px-6 lg:px-0">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">Jadwal VOS</h2>
            </div>
            
            <div className="hidden lg:block relative w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input type="text" placeholder="Cari agenda..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-purple-500/10 transition-all" />
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-0 pb-5 pt-2 space-y-4">
          <div className="lg:hidden relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Cari agenda..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold outline-none shadow-sm" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
              {(['upcoming', 'all'] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`flex-1 lg:px-6 py-2.5 px-4 rounded-xl text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    statusFilter === s ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s === 'upcoming' ? 'Mendatang' : 'Semua'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full lg:flex lg:w-auto">
              <div className="relative">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-2 pr-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none appearance-none shadow-sm"
                >
                  <option value="all">Bulan</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
              </div>

              <div className="relative">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-2 pr-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none appearance-none shadow-sm"
                >
                  <option value="all">Kategori</option>
                  <option value="Latihan">Latihan</option>
                  <option value="Pelayanan">Pelayanan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
              </div>

              <div className="relative">
                <select 
                  value={selectedVoteStatus} 
                  onChange={(e) => setSelectedVoteStatus(e.target.value as VoteStatus)}
                  className="w-full pl-2 pr-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none appearance-none shadow-sm"
                >
                  <option value="all">Voted</option>
                  <option value="voted">Sudah</option>
                  <option value="not_voted">Belum</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="px-6 lg:px-0 py-4">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const userAttendance = state.attendance.find(a => a.eventId === event.id && a.userId === state.currentUser?.id);
              const isConfirmed = !!userAttendance;
              const isPresent = userAttendance?.status === 'present';

              // Dynamic styles based on category
              const categoryStyles = {
                Latihan: { 
                  badge: 'bg-blue-50 text-blue-600 border-blue-100', 
                  border: 'border-blue-500/20',
                  calendar: 'bg-blue-50 text-blue-600 border-blue-100'
                },
                Pelayanan: { 
                  badge: 'bg-amber-50 text-amber-600 border-amber-100', 
                  border: 'border-amber-500/20',
                  calendar: 'bg-amber-50 text-amber-600 border-amber-100'
                },
                Lainnya: { 
                  badge: 'bg-purple-50 text-purple-600 border-purple-100', 
                  border: 'border-purple-500/20',
                  calendar: 'bg-purple-50 text-purple-600 border-purple-100'
                }
              }[event.category] || { 
                badge: 'bg-slate-50 text-slate-600 border-slate-100', 
                border: 'border-slate-500/10',
                calendar: 'bg-blue-50 text-blue-600 border-blue-100'
              };
              
              return (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] group cursor-pointer flex flex-col ${categoryStyles.border}`}
                >
                  <div className="p-5 flex items-center gap-5 relative">
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black shrink-0 border shadow-sm ${categoryStyles.calendar}`}>
                      <span className="text-xl leading-none">{getDay(event.date)}</span>
                      <span className="text-[9px] uppercase">{getMonthLabel(event.date)}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${categoryStyles.badge}`}>
                          {event.category}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-[14px] lg:text-[15px] leading-tight">
                        {event.title}
                      </h4>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          📅 {getDayName(event.date)}, {formatTimeOnly(event.date)}
                        </p>
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          📍 {event.location}
                        </p>
                      </div>
                    </div>

                    {isConfirmed && (
                      <div className="flex items-center justify-center shrink-0">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isPresent ? 'bg-green-100 border-green-200 text-green-600' : 'bg-red-100 border-red-200 text-red-600'}`}>
                            {isPresent ? <Check size={20} strokeWidth={4} /> : <X size={20} strokeWidth={4} />}
                         </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hadir & Izin Buttons for User Card (Minimise effect) */}
                  {!isConfirmed && !isAdmin && (
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
                        <button 
                          onClick={(e) => handlePresent(event.id, e)} 
                          className="py-3 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={14} strokeWidth={3} /> Hadir
                        </button>
                        <button 
                          onClick={(e) => handleAbsent(event.id, e)} 
                          className="py-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle size={14} strokeWidth={3} /> Izin
                        </button>
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="px-5 pb-5 mt-auto">
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingEvent(event); }} 
                          className="py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-blue-500"
                        >
                          <Edit2 size={14} strokeWidth={3} /> Ubah
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEventToDelete(event); }} 
                          className="py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-500"
                        >
                          <Trash2 size={14} strokeWidth={3} /> Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Calendar className="mx-auto mb-4 text-slate-200" size={64} />
            <p className="text-[12px] lg:text-[14px] font-black text-slate-400 uppercase tracking-widest">Tidak ada jadwal yang sesuai</p>
          </div>
        )}
      </main>

      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        currentStatus={currentStatusInModal}
        onPresent={(id) => submitAttendance(id, 'present')}
        onAbsent={(id) => setAbsenceEventId(id)}
      />
      
      <ReasonInputModal 
        isOpen={!!absenceEventId} 
        onClose={() => setAbsenceEventId(null)} 
        onSubmit={submitAbsentReason}
        eventTitle={state.events.find(e => e.id === absenceEventId)?.title || ''}
      />
      
      <EventFormModal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} onSubmit={handleEditSubmit} initialData={editingEvent} />
      <DeleteConfirmModal 
        isOpen={!!eventToDelete} 
        onClose={() => setEventToDelete(null)} 
        onConfirm={handleDeleteConfirmed} 
        eventTitle={eventToDelete?.title || ''} 
      />
    </div>
  );
};
