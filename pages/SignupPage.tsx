import React from 'react';
import { ArrowLeft, Mail, UserPlus, UserCircle, Phone, Music2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { VoicePart, UserRole } from '../types';
import { ROUTES } from '../constants/routes';

export const SignupPage = () => {
  const { signUp } = useApp();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // Sign Up States
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [voicePart, setVoicePart] = React.useState<VoicePart>(VoicePart.SOPRAN);
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== passwordConfirm) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setIsProcessing(true);
    try {
      await signUp({
        name,
        email,
        phone,
        voicePart,
        password,
        role: UserRole.USER
      });
      setSuccess('Pendaftaran Terkirim! Mohon tunggu konfirmasi aktifasi dari Admin.');
      // Reset fields
      setName(''); setEmail(''); setPhone(''); setPassword(''); setPasswordConfirm('');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 lg:p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="space-y-6">
          <button onClick={() => navigate(ROUTES.LOGIN)} className="flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={16} strokeWidth={3} /> Kembali Login
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Daftar Akun</h1>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">Data Anggota Voice of Soul Choir</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-green-100">
                {success}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs" 
                  placeholder="Nama Anda" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs"
                  placeholder="email@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">No. HP</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs"
                    placeholder="08..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Suara</label>
                <div className="relative">
                  <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <select value={voicePart} onChange={(e) => setVoicePart(e.target.value as VoicePart)}
                    className="w-full p-3.5 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs appearance-none">
                    <option value={VoicePart.SOPRAN}>Sopran</option>
                    <option value={VoicePart.ALTO}>Alto</option>
                    <option value={VoicePart.TENOR}>Tenor</option>
                    <option value={VoicePart.BASS}>Bass</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sandi</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs"
                  placeholder="Min 6 Karakter" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ulangi</label>
                <input required type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs"
                  placeholder="Konfirmasi" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all border border-purple-500 shadow-xl shadow-purple-100 hover:bg-purple-700 mt-2"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><UserPlus size={16} /> Daftar Sekarang</>}
            </button>
          </form>
        </div>
        
        <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-[0.2em] mt-8 opacity-50">
          VOS Database • v2.1 
        </p>
      </div>
    </div>
  );
};