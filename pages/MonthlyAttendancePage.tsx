import React, { useMemo } from 'react';
import { ArrowLeft, Activity, Calendar, MapPin, CheckCircle, XCircle, HelpCircle, Clock, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { UserStatus } from '../types';

export const MonthlyAttendancePage = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;

  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const { stats, eventsWithStatus } = useMemo(() => {
    if (!user) return { stats: { present: 0, total: 0, percent: 0 }, eventsWithStatus: [] };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Filter event bulan ini & kategori Latihan/Pelayanan
    const monthlyEvents = state.events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear &&
             ['Latihan', 'Pelayanan'].includes(e.category);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Map status kehadiran untuk setiap event
    const mappedEvents = monthlyEvents.map(event => {
      const attendance = state.attendance.find(a => a.eventId === event.id && a.userId === user.id);
      return {
        ...event,
        attendanceStatus: attendance ? attendance.status : 'none', // 'none' means absen/alpha/belum isi
        attendanceReason: attendance?.reason
      };
    });

    // 3. Hitung Statistik
    const totalEvents = monthlyEvents.length;
    const presentCount = mappedEvents.filter(e => e.attendanceStatus === 'present').length;
    const percent = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0;

    return { 
      stats: { present: presentCount, total: totalEvents, percent },
      eventsWithStatus: mappedEvents
    };
  }, [state.events, state.attendance, user]);

  // Determine card style based on percentage
  const getCardStyle = (percent: number) => {
    if (percent === 100) return "bg-gradient-to-br from-emerald-500 to-green-600 shadow-green-200 shadow-xl";
    if (percent < 50) return "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200 shadow-xl";
    if (percent < 80) return "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200 shadow-xl";
    return "bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-200 shadow-xl";
  };

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm">
        <div className="pt-5 pb-4 px-6 lg:px-0 max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-purple-600 bg-white rounded-xl shadow-sm border border-purple-100 active:scale-95 transition-all">
            <ArrowLeft size={18} strokeWidth={3} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Detail Kehadiran</h2>
            <p className="text-purple-600/60 text-[10px] font-black tracking-[0.2em] mt-0.5 uppercase">{currentMonthName}</p>
          </div>
        </div>
      </div>

      <main className="px-6 py-6 space-y-8 max-w-2xl mx-auto">
        
        {/* SUMMARY CARD */}
        <div>
          <div className={`${getCardStyle(stats.percent)} rounded-[32px] p-6 text-white relative overflow-hidden transition-all duration-500`}>
            <div className="relative z-10 flex items-center gap-5">
               <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                 <Activity size={32} strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-white/70 tracking-widest uppercase">Persentase Kehadiran</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-4xl font-black">{stats.percent}%</h3>
                   <p className="text-[12px] font-bold text-white/90">({stats.present} dari {stats.total} kegiatan)</p>
                 </div>
               </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
              <Activity size={150} />
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-400 text-center mt-3 italic">
            "Kehadiran dihitung adalah semua yang termasuk Latihan dan Pelayanan"
          </p>
        </div>

        {/* EVENTS LIST (WITH ICONS) */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Riwayat Kegiatan Bulan Ini</h4>
          
          {eventsWithStatus.length > 0 ? (
            <div className="space-y-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              {eventsWithStatus.map((event) => {
                const isPresent = event.attendanceStatus === 'present';
                const isAbsent = event.attendanceStatus === 'absent';
                const dateStr = new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
                
                return (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${isPresent ? 'bg-green-100 text-green-600' : isAbsent ? 'bg-red-100 text-red-600' : 'bg-slate-100'}`}>
                       {isPresent ? <Check size={12} strokeWidth={4} /> : isAbsent ? <X size={12} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    </div>
                    <div className={`text-[12px] lg:text-[14px] font-bold ${isPresent || isAbsent ? 'text-slate-700' : 'text-slate-400'} leading-relaxed`}>
                      {dateStr}, {event.category} {event.location}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-12">
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Tidak ada jadwal bulan ini</p>
             </div>
          )}
        </div>

      </main>
    </div>
  );
};