import React from 'react';
import { Music, Loader2, Mail, Key, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ROUTES } from '../constants/routes';

export const LoginPage = () => {
  const { state, login } = useApp();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // Login States
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setError('');
    
    const emailToUse = customEmail || loginEmail;
    const passwordToUse = customPassword || loginPassword;

    try {
      const success = await login(emailToUse, passwordToUse);
      if (success) {
        navigate(ROUTES.HOME, { replace: true });
      }
    } catch (err: any) {
      // Custom error message mapping as requested
      let errorMessage = err.message || 'Email atau password salah';
      if (errorMessage === 'Invalid login credentials') {
        errorMessage = 'User tidak terdaftar';
      }
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      handleLogin(undefined, 'admin@vos.com', 'admin1234');
    } else {
      handleLogin(undefined, 'Daftar@example.com', '123456');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 lg:p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="space-y-10">
          <div className="text-center">
            {/* Logo Container updated to match App Icon style */}
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-[28px] shadow-2xl shadow-purple-100 border-4 border-white bg-purple-600 overflow-hidden relative">
              {state.appLogoUrl ? (
                  <img src={state.appLogoUrl} alt="App Logo" className="w-full h-full object-cover bg-white" />
              ) : (
                  <Music size={40} strokeWidth={2.5} className="text-white" />
              )}
            </div>
            
            <h1 className="text-3xl font-black text-purple-600 tracking-tight uppercase">VOS</h1>
            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">Voice of Soul Choir</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100 animate-shake">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-green-100">
                {success}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email</label>
              <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                  type="email" 
                  required
                  disabled={isProcessing}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm disabled:opacity-50"
                  placeholder="nama@vos.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setError(''); setSuccess(''); }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Kata Sandi</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  disabled={isProcessing}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm disabled:opacity-50"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setError(''); setSuccess(''); }}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all mt-6 flex items-center justify-center gap-2 hover:bg-purple-700 shadow-xl shadow-purple-200"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Masuk'}
            </button>
          </form>

          {/* Developer Login Shortcuts */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest">Developer Quick Login</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleQuickLogin('admin')}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-purple-50 text-purple-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-purple-100 hover:bg-purple-100 active:scale-95 transition-all"
              >
                <ShieldCheck size={14} /> Admin
              </button>
              <button 
                onClick={() => handleQuickLogin('user')}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <User size={14} /> User
              </button>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[11px] font-bold text-slate-400">Belum terdaftar sebagai anggota?</p>
            <button 
              onClick={() => navigate(ROUTES.SIGNUP)}
              className="mt-2 text-purple-600 font-black text-[11px] uppercase tracking-widest hover:underline"
            >
              Buat Akun
            </button>
          </div>
        </div>

        <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-[0.2em] mt-8 opacity-50">
          VOS Database • v1.0 
        </p>
      </div>
    </div>
  );
};