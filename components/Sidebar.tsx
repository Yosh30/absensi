import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Megaphone, User as UserIcon, Shield, Music, LogOut } from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';
import { ROUTES } from '../constants/routes';

export const Sidebar = () => {
  const location = useLocation();
  const { state, logout } = useApp();
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  const links = [
    { to: ROUTES.HOME, icon: Home, label: 'Dashboard' },
    { to: ROUTES.SCHEDULE, icon: Calendar, label: 'Jadwal Kegiatan' },
    { to: ROUTES.ANNOUNCEMENTS, icon: Megaphone, label: 'Informasi & Info' },
    { to: ROUTES.PROFILE, icon: UserIcon, label: 'Profil Saya' },
  ];

  if (isAdmin) {
    links.splice(3, 0, { to: ROUTES.ADMIN, icon: Shield, label: 'Admin Panel' });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-100 h-screen sticky top-0 overflow-y-auto z-50">
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-100 border border-purple-400 overflow-hidden relative">
            {state.appLogoUrl ? (
              <img src={state.appLogoUrl} alt="VOS Logo" className="w-full h-full object-cover bg-white" />
            ) : (
              <Music size={20} strokeWidth={2.5} />
            )}
          </div>
          <div>
            <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Absensi</h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] mt-1 uppercase">Voice of Soul</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'group-hover:text-purple-600'} />
                <span className="text-[11px] lg:text-xs font-black uppercase tracking-widest">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 lg:p-8 border-t border-slate-50">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 font-black text-sm border border-slate-100">
            {state.currentUser?.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black text-slate-900 truncate">{state.currentUser?.name}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{state.currentUser?.voicePart}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={18} /> Keluar Aplikasi
        </button>
      </div>
    </aside>
  );
};