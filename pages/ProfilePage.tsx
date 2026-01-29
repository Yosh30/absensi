
import React, { useMemo } from 'react';
import { LogOut, User as UserIcon, Phone, ShieldCheck, Calendar as CalendarIcon, ChevronRight, Activity, Download, Smartphone, Share } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ROUTES } from '../constants/routes';

export const ProfilePage = () => {
  const { state, logout, installApp, isInstallable } = useApp();
  const user = state.currentUser;
  const navigate = useNavigate();
  
  // Detect iOS for specific instructions (since they don't support beforeinstallprompt)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const stats = useMemo(() => {
    if (!user) return { present: 0, total: 0, percent: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter event bulan ini & kategori Latihan/Pelayanan saja
    const monthlyEvents = state.events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear &&
             ['Latihan', 'Pelayanan'].includes(e.category);
    });

    const totalEvents = monthlyEvents.length;

    // Hitung kehadiran (status 'present')
    const presentCount = monthlyEvents.filter(e => {
      const att = state.attendance.find(a => a.eventId === e.id && a.userId === user.id);
      return att?.status === 'present';
    }).length;

    const percent = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0;

    return { present: presentCount, total: totalEvents, percent };
  }, [state.events, state.attendance, user]);

  const getCardStyle = (percent: number) => {
    if (percent === 100) return "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl shadow-green-100";
    if (percent < 50) return "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-100";
    if (percent < 80) return "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-100";
    return "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-100";
  };

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      {/* COMPACT FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm lg:static lg:bg-transparent lg:border-none lg:shadow-none">
        <div className="bg-white lg:bg-transparent pt-5 pb-3 px-6 lg:px-0">
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">Akun Saya</h2>
          <p className="text-purple-600/60 text-[8px] lg:text-[11px] font-black tracking-[0.2em] mt-0.5 uppercase">Identitas & Pengaturan</p>
        </div>
      </div>

      <main className="px-6 lg:px-0 space-y-6 pt-20 lg:pt-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 md:w-32 lg:h-32 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl">
            {user?.name.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
            <p className="text-slate-400 text-[12px] font-bold mt-1 uppercase tracking-widest">{user?.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
               <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                 {user?.voicePart}
               </span>
               <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                 {user?.role}
               </span>
            </div>
          </div>
        </div>
        
        {/* PWA INSTALLATION SECTION */}
        {(isInstallable || isIOS) && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                   <Download className="text-white" size={24} />
                </div>
                <div className="flex-1">
                   <h3 className="font-black text-lg leading-tight">Install Aplikasi</h3>
                   <p className="text-[10px] opacity-70 mt-1 leading-relaxed">
                     {isIOS 
                       ? "Untuk pengguna iOS (iPhone/iPad), install manual:" 
                       : "Pasang aplikasi VOS di layar utama HP Anda untuk akses lebih cepat dan offline."}
                   </p>
                   
                   {isIOS ? (
                      <div className="mt-3 bg-white/10 p-3 rounded-xl border border-white/10">
                         <p className="text-[10px] font-bold flex items-center gap-2">
                           1. Klik tombol <Share size={12} /> Share di browser
                         </p>
                         <p className="text-[10px] font-bold mt-1 flex items-center gap-2">
                           2. Pilih "Add to Home Screen"
                         </p>
                      </div>
                   ) : (
                      <button 
                        onClick={installApp}
                        className="mt-4 px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                      >
                        Install Sekarang
                      </button>
                   )}
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calendar Shortcut */}
          <button 
            onClick={() => navigate('/calendar')}
            className="w-full bg-purple-600 p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-purple-100 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <CalendarIcon size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-white font-black text-[14px]">Kalender Kegiatan</p>
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Lihat jadwal bulanan</p>
              </div>
            </div>
            <ChevronRight className="text-white/40" size={20} strokeWidth={3} />
          </button>

          {/* Monthly Attendance Stats - Clickable with Dynamic Color */}
          <button 
             onClick={() => navigate(ROUTES.PROFILE_ATTENDANCE)}
             className={`w-full rounded-3xl p-6 flex items-center justify-between active:scale-[0.98] transition-all group text-left ${getCardStyle(stats.percent)}`}
          >
             <div className="flex items-center gap-5">
               <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                 <Activity size={24} strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-[9px] font-black opacity-70 tracking-widest uppercase">Kehadiran Bulan Ini</p>
                 <div className="flex items-baseline gap-1.5 mt-0.5">
                   <p className="text-2xl font-black leading-none">{stats.percent}%</p>
                   <p className="text-[10px] font-bold opacity-80">({stats.present} hadir dari {stats.total})</p>
                 </div>
               </div>
             </div>
             <ChevronRight className="text-white/40 group-hover:text-white transition-colors" size={20} strokeWidth={3} />
          </button>
        </div>

        <button 
          onClick={logout}
          className="w-full md:w-fit px-12 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-red-100 active:scale-95 transition-all hover:bg-red-100 shadow-sm"
        >
          <LogOut size={18} strokeWidth={3} /> Keluar Aplikasi
        </button>
      </main>
    </div>
  );
}
