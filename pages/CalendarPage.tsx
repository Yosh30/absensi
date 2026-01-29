
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Clock, MapPin, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ChoirEvent } from '../types';
import { EventDetailModal } from '../components/EventDetailModal';
import { ReasonInputModal } from '../components/ReasonInputModal';

export const CalendarPage = () => {
  const { state, submitAttendance } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [selectedEventModal, setSelectedEventModal] = useState<ChoirEvent | null>(null);
  const [absenceEventId, setAbsenceEventId] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthYearLabel = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = startDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    return state.events.filter(event => {
      const eDate = new Date(event.date);
      return eDate.getDate() === day && 
             eDate.getMonth() === currentDate.getMonth() && 
             eDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handlePresent = (eventId: string) => {
    submitAttendance(eventId, 'present');
  };

  const handleAbsent = (eventId: string) => {
    setAbsenceEventId(eventId);
  };

  const submitAbsentReason = (reason: string) => {
    if (absenceEventId) {
      submitAttendance(absenceEventId, 'absent', reason);
      setAbsenceEventId(null);
    }
  };

  const getDayClasses = (day: number | null, index: number) => {
    if (!day) return 'invisible';
    
    const isSelected = selectedDay === day;
    const isToday = (day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear());
    const isSunday = index % 7 === 0;
    const events = getEventsForDay(day);
    const hasEvents = events.length > 0;

    let base = 'relative aspect-square flex flex-col items-center justify-center text-[10px] lg:text-[14px] font-black rounded-2xl transition-all duration-300 border-2 ';
    
    if (isSelected) {
      return base + 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-100 scale-105 z-10 ';
    }

    if (hasEvents) {
      const firstCategory = events[0].category;
      if (firstCategory === 'Latihan') {
        return base + 'bg-blue-500 text-white border-blue-600 shadow-md ';
      } else if (firstCategory === 'Pelayanan') {
        return base + 'bg-amber-500 text-white border-amber-600 shadow-md ';
      } else {
        return base + 'bg-purple-400 text-white border-purple-500 shadow-md ';
      }
    }

    if (isToday) {
      return base + 'bg-white text-purple-600 border-purple-200 shadow-sm ';
    }

    base += 'bg-white border-slate-50 hover:bg-slate-50 ';
    if (isSunday) base += 'text-red-500 ';
    else base += 'text-slate-600 ';
    
    return base;
  };

  const selectedDayEvents = useMemo(() => getEventsForDay(selectedDay), [selectedDay, currentDate, state.events]);

  const currentStatusInModal = state.attendance.find(
    a => a.eventId === selectedEventModal?.id && a.userId === state.currentUser?.id
  );

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm lg:static lg:bg-transparent lg:border-none lg:shadow-none">
        <div className="pt-5 pb-3 px-6 lg:px-0 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-purple-600 bg-white rounded-xl shadow-sm border border-purple-100 active:scale-95 transition-all">
            <ArrowLeft size={18} strokeWidth={3} />
          </button>
          <div>
            <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Kalender VOS</h2>
          </div>
        </div>
      </div>

      <main className="px-6 lg:px-0 space-y-8 pt-20 lg:pt-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-4xl">
          <div className="flex justify-between items-center mb-10 px-1">
            <h3 className="font-black text-slate-900 text-[16px] lg:text-[22px] tracking-tight uppercase tracking-widest">{monthYearLabel}</h3>
            <div className="flex gap-3">
              <button onClick={() => changeMonth(-1)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-purple-600 transition-colors border border-slate-100">
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <button onClick={() => changeMonth(1)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-purple-600 transition-colors border border-slate-100">
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((d, i) => (
              <div key={d} className={`text-center text-[10px] lg:text-[12px] font-black uppercase tracking-widest py-3 ${ i === 0 ? 'text-red-400' : 'text-slate-300'}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 lg:gap-4">
            {calendarDays.map((day, idx) => {
              return (
                <button 
                  key={idx} 
                  disabled={!day} 
                  onClick={() => day && setSelectedDay(day)} 
                  className={getDayClasses(day, idx)}
                >
                  <span className="text-base lg:text-xl">{day}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 max-w-4xl">
          <div className="px-1 flex items-center justify-between">
            <h4 className="text-[11px] lg:text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {selectedDay ? `Agenda ${selectedDay} ${monthYearLabel.split(' ')[0]}` : 'Pilih Tanggal'}
            </h4>
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDayEvents.map(event => (
                <div 
                  key={event.id} 
                  onClick={() => setSelectedEventModal(event)} 
                  className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group hover:shadow-md hover:border-purple-100 ${
                    event.category === 'Latihan' ? 'border-l-8 border-l-blue-400' : 
                    event.category === 'Pelayanan' ? 'border-l-8 border-l-amber-400' : 'border-l-8 border-l-purple-400'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <h5 className="font-black text-slate-900 text-base lg:text-lg truncate group-hover:text-purple-600 transition-colors leading-tight">{event.title}</h5>
                    <div className="flex items-center gap-4 mt-2 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-300" />
                        <span className="text-[10px] lg:text-[12px] font-bold">{new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRightIcon size={20} strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDay ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-16 text-center">
              <p className="text-[12px] lg:text-[14px] font-black text-slate-400 uppercase tracking-widest">Tidak ada agenda di tanggal ini</p>
            </div>
          ) : null}
        </div>
      </main>

      <EventDetailModal 
        event={selectedEventModal} 
        onClose={() => setSelectedEventModal(null)} 
        currentStatus={currentStatusInModal}
        onPresent={handlePresent}
        onAbsent={handleAbsent}
      />
      
      <ReasonInputModal 
        isOpen={!!absenceEventId} 
        onClose={() => setAbsenceEventId(null)} 
        onSubmit={submitAbsentReason}
        eventTitle={state.events.find(e => e.id === absenceEventId)?.title || ''}
      />
    </div>
  );
};
