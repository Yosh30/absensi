
import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Phone, Music, UserPlus } from 'lucide-react';
import { VoicePart, UserRole } from '../types';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    name: string;
    email: string;
    role: UserRole;
    voicePart: VoicePart;
    phone: string;
  }) => void;
}

export const RegisterUserModal: React.FC<RegisterUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [voicePart, setVoicePart] = useState<VoicePart>(VoicePart.SOPRAN);
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    
    onSubmit({
      name,
      email,
      role: UserRole.USER,
      voicePart,
      phone,
    });
    
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Registrasi Anggota</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Internal Voice of Soul</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Budi Santoso"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@vos.com"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bagian Suara</label>
              <select value={voicePart} onChange={(e) => setVoicePart(e.target.value as VoicePart)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs appearance-none">
                  <option value={VoicePart.SOPRAN}>Sopran</option>
                  <option value={VoicePart.ALTO}>Alto</option>
                  <option value={VoicePart.TENOR}>Tenor</option>
                  <option value={VoicePart.BASS}>Bass</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon</label>
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs" />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Kata sandi default: <span className="text-purple-600">123456</span>
            </p>
            <button 
              type="submit" 
              className="w-full py-3.5 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all border border-purple-100 hover:bg-purple-100"
            >
              <UserPlus size={16} /> Daftarkan Anggota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
