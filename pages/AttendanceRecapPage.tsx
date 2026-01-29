
import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, FileDown, Download, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { VoicePart } from '../types';

export const AttendanceRecapPage = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Hitung statistik untuk setiap user
  const userRecap = useMemo(() => {
    // Ambil semua event yang sudah lewat (atau hari ini)
    const now = Date.now();
    const pastEvents = state.events.filter(e => new Date(e.date).getTime() <= now);
    const totalPastEvents = pastEvents.length;

    return state.users.map(user => {
      const attendances = state.attendance.filter(a => a.userId === user.id);
      const presentCount = attendances.filter(a => a.status === 'present').length;
      const absentCount = attendances.filter(a => a.status === 'absent').length;
      const percentage = totalPastEvents > 0 ? (presentCount / totalPastEvents) * 100 : 0;

      return {
        ...user,
        presentCount,
        absentCount,
        percentage,
        totalEventsPossible: totalPastEvents
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [state.users, state.attendance, state.events]);

  const filteredRecap = useMemo(() => {
    return userRecap.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.voicePart.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userRecap, searchQuery]);

  const exportToCSV = () => {
    const headers = ['Nama', 'Bagian Suara', 'Total Hadir', 'Total Izin', 'Total Agenda', 'Persentase'];
    const rows = filteredRecap.map(u => [
      u.name,
      u.voicePart,
      u.presentCount,
      u.absentCount,
      u.totalEventsPossible,
      `${u.percentage.toFixed(1)}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Absensi_VOS_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="sticky lg:static top-0 z-40 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-none border-purple-100 shadow-sm lg:shadow-none">
        <div className="pt-5 pb-4 px-6 lg:px-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 text-purple-600 bg-white rounded-xl shadow-sm border border-purple-100 active:scale-95 transition-all">
              <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">Rekap Absensi</h2>
              <p className="text-purple-600/60 text-[8px] lg:text-[11px] font-black tracking-[0.2em] mt-0.5 uppercase">Laporan Kehadiran Member</p>
            </div>
          </div>
          <button 
            onClick={exportToCSV}
            className="p-3 bg-green-600 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 transition-all"
          >
            <Download size={16} strokeWidth={3} /> 
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <main className="px-6 lg:px-0 py-6 space-y-6">
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
               <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-rata Kehadiran</p>
              <h4 className="text-2xl font-black text-slate-900">
                {(userRecap.reduce((acc, curr) => acc + curr.percentage, 0) / Math.max(userRecap.length, 1)).toFixed(1)}%
              </h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
               <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Agenda Selesai</p>
              <h4 className="text-2xl font-black text-slate-900">
                {userRecap[0]?.totalEventsPossible || 0} Sesi
              </h4>
            </div>
          </div>
        </div>

        {/* SEARCH & LIST */}
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Cari anggota atau suara..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all shadow-sm" 
            />
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Anggota</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Kehadiran</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecap.length > 0 ? (
                    filteredRecap.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-black text-slate-900 truncate">{user.name}</p>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                user.voicePart === VoicePart.SOPRAN ? 'bg-rose-50 text-rose-500' :
                                user.voicePart === VoicePart.ALTO ? 'bg-amber-50 text-amber-500' :
                                user.voicePart === VoicePart.TENOR ? 'bg-blue-50 text-blue-500' :
                                'bg-emerald-50 text-emerald-500'
                              }`}>
                                {user.voicePart}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-[14px] font-black text-slate-700">
                              {user.presentCount} <span className="text-slate-300 font-bold">/ {user.totalEventsPossible}</span>
                            </p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hadir</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center gap-2">
                             <div className="w-full max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${
                                   user.percentage >= 80 ? 'bg-green-500' : 
                                   user.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                 }`} 
                                 style={{ width: `${user.percentage}%` }} 
                               />
                             </div>
                             <span className={`text-[12px] font-black ${
                               user.percentage >= 80 ? 'text-green-600' : 
                               user.percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                             }`}>
                               {user.percentage.toFixed(1)}%
                             </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Data tidak ditemukan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
