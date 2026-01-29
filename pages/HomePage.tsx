import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Megaphone, CheckCircle, XCircle, Music, Check, X, Edit2, Users, Trash2, MapPin, Clock } from 'lucide-react';
import { useApp } from '../App';
import { EventDetailModal } from '../components/EventDetailModal';
import { EventFormModal } from '../components/CreateEventModal';
import { ReasonInputModal } from '../components/ReasonInputModal';
import { ChoirEvent, UserRole } from '../types';

export const HomePage = () => {
  const { state, updateEvent, deleteEvent, submitAttendance } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<ChoirEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChoirEvent | null>(null);
  const [absenceEventId, setAbsenceEventId] = useState<string | null>(null);
  
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  const upcomingEvents = [...state.events]
    .filter(event => new Date(event.date).getTime() > Date.now() - 86400000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const handleEditSubmit = (data: Omit<ChoirEvent, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    }
  };

  const handlePresent = (eventId: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    submitAttendance(eventId, 'present');
  };

  const handleAbsent = (eventId: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
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

  const formatAnnouncementDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const d = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const t = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${d}, ${t}`;
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' });
  };

  const getDay = (dateStr: string) => new Date(dateStr).getDate();
  const getMonth = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'short' });

  const firstEvent = upcomingEvents[0];
  const otherEvents = upcomingEvents.slice(1);
  const firstEventAttendance = state.attendance.find(
    a => a.eventId === firstEvent?.id && a.userId === state.currentUser?.id
  );

  const currentStatusInModal = state.attendance.find(
    a => a.eventId === selectedEvent?.id && a.userId === state.currentUser?.id
  );

  return (
    <div className="pb-24 lg:pb-8 min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-purple-100 lg:static lg:bg-transparent lg:border-none shadow-sm lg:shadow-none">
        <div className="bg-white lg:bg-transparent pt-6 pb-4 px-6 lg:px-0 max-w-7xl mx-auto">
          <p className="text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Voice of Soul Choir</p>
          <div className="flex justify-between items-center">
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">Halo, {state.currentUser?.name.split(' ')[0]} 👋</h2>
          </div>
        </div>
      </div>

      <main className="px-6 lg:px-0 space-y-8 mt-24 lg:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            <div 
              onClick={() => firstEvent && setSelectedEvent(firstEvent)}
              className="bg-purple-600 rounded-2xl lg:rounded-3xl p-6 lg:p-10 text-white shadow-xl shadow-purple-100 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-purple-200 cursor-pointer"
            >
              <div className="relative z-10 flex flex-col space-y-4">
                <div>
                  <h3 className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-yellow-300 border border-white/20 backdrop-blur-md shadow-sm">
                    ✨ Jadwal Terdekat
                  </h3>
                </div>
                
                {firstEvent ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-5 lg:gap-10">
                      <div className="w-20 h-20 lg:w-28 lg:h-32 bg-white rounded-3xl flex flex-col items-center justify-center font-black shrink-0 text-purple-600 shadow-xl border-4 border-purple-50 transition-transform group-hover:scale-105">
                        <span className="text-[10px] lg:text-[12px] uppercase opacity-70 mb-0.5 tracking-tighter">{getDayName(firstEvent.date).slice(0, 3)}</span>
                        <span className="text-3xl lg:text-5xl lg:text-6xl leading-none py-0.5">{getDay(firstEvent.date)}</span>
                        <span className="text-[10px] lg:text-[12px] uppercase mt-0.5 tracking-widest">{getMonth(firstEvent.date)}</span>
                      </div>

                      <div className="flex-1 space-y-2 lg:space-y-4 min-w-0 pt-0.5 lg:pt-1.5">
                        <p className="text-xl lg:text-4xl lg:text-5xl font-black leading-tight tracking-tight line-clamp-2 pb-1">{firstEvent.title}</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2 text-[11px] lg:text-[15px] font-bold opacity-90">
                            <span className="opacity-70">📅</span> {getDayName(firstEvent.date)}, {formatTimeOnly(firstEvent.date)}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] lg:text-[15px] font-bold opacity-90 truncate">
                            <span className="opacity-70">📍</span> {firstEvent.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center w-full">
                      {firstEventAttendance ? (
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 px-6 rounded-2xl border border-white/10 animate-in fade-in zoom-in-95">
                          {firstEventAttendance.status === 'present' ? (
                            <>
                              <CheckCircle size={20} className="text-green-400" strokeWidth={3} />
                              <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-green-400">Konfirmasi : Hadir</p>
                            </>
                          ) : (
                            <>
                              <XCircle size={20} className="text-amber-300" strokeWidth={3} />
                              <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-amber-300">Konfirmasi : Izin</p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-4 w-full justify-center">
                          <button 
                            onClick={(e) => handlePresent(firstEvent.id, e)}
                            className="px-8 py-4 bg-white text-green-600 rounded-2xl font-black text-xs lg:text-sm uppercase tracking-widest hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                          >
                            <CheckCircle size={18} strokeWidth={3} /> Hadir
                          </button>
                          <button 
                            onClick={(e) => handleAbsent(firstEvent.id, e)}
                            className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-xs lg:text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                          >
                            <XCircle size={18} strokeWidth={3} /> Izin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-black mt-1">Belum ada agenda terdaftar</p>
                )}
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 scale-150 text-white pointer-events-none">
                <Music size={280} strokeWidth={1} />
              </div>
            </div>

            {otherEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1 mb-1">
                  <h3 className="font-black text-slate-900 text-[14px] lg:text-[18px] tracking-tight">Jadwal Lainnya</h3>
                  <Link to="/schedule" className="text-[11px] lg:text-[13px] text-purple-600 font-bold">Lihat Semua</Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {otherEvents.map((event) => {
                    const userAttendance = state.attendance.find(a => a.eventId === event.id && a.userId === state.currentUser?.id);
                    const isConfirmed = !!userAttendance;
                    const isPresent = userAttendance?.status === 'present';
                    
                    const categoryStyles = {
                      Latihan: { badge: 'bg-blue-50 text-blue-600 border-blue-100', calendar: 'bg-blue-50 text-blue-600 border-blue-100' },
                      Pelayanan: { badge: 'bg-amber-50 text-amber-600 border-amber-100', calendar: 'bg-amber-50 text-amber-600 border-amber-100' },
                      Lainnya: { badge: 'bg-purple-50 text-purple-600 border-purple-100', calendar: 'bg-purple-50 text-purple-600 border-purple-100' },
                    }[event.category] || { badge: 'bg-slate-50 text-slate-600 border-slate-100', calendar: 'bg-blue-50 text-blue-600 border-blue-100' };

                    return (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md cursor-pointer flex items-center gap-5"
                      >
                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black shrink-0 border shadow-sm ${categoryStyles.calendar}`}>
                          <span className="text-xl leading-none">{getDay(event.date)}</span>
                          <span className="text-[9px] uppercase">{getMonth(event.date)}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${categoryStyles.badge}`}>
                              {event.category}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 text-[14px] lg:text-[15px] leading-tight">
                            {event.title}
                          </h4>
                          <div className="mt-1.5 space-y-0.5">
                            <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              📅 {getDayName(event.date)}, {formatTimeOnly(event.date)}
                            </p>
                            <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              📍 {event.location}
                            </p>
                          </div>
                        </div>

                        {isConfirmed && (
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isPresent ? 'bg-green-100 border-green-200 text-green-600' : 'bg-red-100 border-red-200 text-red-600'}`}>
                                {isPresent ? <Check size={20} strokeWidth={4} /> : <X size={20} strokeWidth={4} />}
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-purple-600" />
                  <h3 className="font-black text-slate-900 text-[14px] lg:text-[18px] tracking-tight">Pengumuman</h3>
                </div>
                <Link to="/announcements" className="text-[11px] lg:text-[13px] text-purple-600 font-bold">Lihat Semua</Link>
              </div>
              <div className="space-y-4">
                {state.announcements.slice(0, 2).map(ann => (
                  <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-black text-slate-900 text-[14px] lg:text-[15px] leading-tight flex-1">{ann.title}</h4>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-slate-300 uppercase tracking-tighter shrink-0">
                        <Clock size={10} /> {formatAnnouncementDate(ann.timestamp)}
                      </div>
                    </div>
                    <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        currentStatus={currentStatusInModal}
        onPresent={(id) => handlePresent(id)}
        onAbsent={(id) => handleAbsent(id)}
      />
      
      <ReasonInputModal 
        isOpen={!!absenceEventId} 
        onClose={() => setAbsenceEventId(null)} 
        onSubmit={submitAbsentReason}
        eventTitle={state.events.find(e => e.id === absenceEventId)?.title || ''}
      />
      
      <EventFormModal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} onSubmit={handleEditSubmit} initialData={editingEvent} />
    </div>
  );
};