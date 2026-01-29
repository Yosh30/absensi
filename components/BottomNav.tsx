
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Megaphone, User as UserIcon, Shield } from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';
import { ROUTES } from '../constants/routes';

export const BottomNav = () => {
  const location = useLocation();
  const { state } = useApp();
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  const links = [
    { to: ROUTES.HOME, icon: Home, label: 'Home' },
    { to: ROUTES.SCHEDULE, icon: Calendar, label: 'Jadwal' },
    { to: ROUTES.ANNOUNCEMENTS, icon: Megaphone, label: 'Info' },
    { to: ROUTES.PROFILE, icon: UserIcon, label: 'Profil' },
  ];

  if (isAdmin) {
    links.splice(3, 0, { to: ROUTES.ADMIN, icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center py-4 px-6 safe-area-bottom z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] lg:hidden">
      {links.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link 
            key={link.to} 
            to={link.to} 
            className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'text-purple-600 scale-125' : 'text-slate-300'}`}
            title={link.label}
          >
            <link.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        );
      })}
    </nav>
  );
};
