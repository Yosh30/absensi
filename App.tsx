import React, { createContext, useContext } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { useAppController } from './controllers/useAppController';
import { AppRoutes } from './AppRoutes';
import { Music, Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

const AppContext = createContext<ReturnType<typeof useAppController> | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const SplashScreen = ({ logoUrl }: { logoUrl?: string | null }) => (
  <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
    <div className="relative mb-8">
      <div className="w-20 h-20 bg-purple-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-purple-100 animate-pulse overflow-hidden border-4 border-white">
        {logoUrl ? (
          <img src={logoUrl} alt="VOS Logo" className="w-full h-full object-cover bg-white" />
        ) : (
          <Music size={40} strokeWidth={2.5} />
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-slate-50">
        <Loader2 className="text-purple-600 animate-spin" size={16} />
      </div>
    </div>
    <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">VOS</h2>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">baloading</p>
  </div>
);

const AppContent = () => {
  const { state, loading } = useApp();
  
  if (loading) return <SplashScreen logoUrl={state.appLogoUrl} />;

  // Logic Change: If user is NOT logged in, we render AppRoutes directly.
  // This allows AppRoutes to handle routing to /login OR /signup specifically.
  if (!state.currentUser) {
    return (
      <div className="bg-slate-50 min-h-screen text-slate-900">
        <AppRoutes />
      </div>
    );
  }

  // If user IS logged in, we wrap AppRoutes with the App Shell (Sidebar/Nav)
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto lg:px-8">
            <AppRoutes />
          </div>
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const controller = useAppController();
  
  return (
    <AppContext.Provider value={controller}>
      <Router>
        <AppContent />
      </Router>
    </AppContext.Provider>
  );
};

export default App;