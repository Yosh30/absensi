
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="sticky top-0 bg-purple-600 text-white p-4 shadow-md z-40 flex justify-between items-center">
      <h1 className="text-xl font-black tracking-tight uppercase">{title}</h1>
      <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center font-black border border-white/20">
        V
      </div>
    </header>
  );
};
