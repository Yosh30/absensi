
import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

interface ReasonInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  eventTitle: string;
  initialReason?: string;
}

export const ReasonInputModal: React.FC<ReasonInputModalProps> = ({ isOpen, onClose, onSubmit, eventTitle, initialReason = '' }) => {
  const [reason, setReason] = useState(initialReason);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason);
    }
  }, [isOpen, initialReason]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 3) {
      setError(true);
      return;
    }
    onSubmit(reason.trim());
    setReason('');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Alasan izin</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{eventTitle}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <textarea
                autoFocus
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Kenapa tidak bisa hadir?"
                className={`w-full h-36 p-5 bg-slate-50 border-2 rounded-xl resize-none outline-none transition-all text-sm font-bold ${
                  error ? 'border-red-200 focus:border-red-400' : 'border-slate-100 focus:border-purple-500'
                }`}
              />
              {error && (
                <div className="flex items-center gap-1.5 mt-3 text-red-500">
                  <AlertCircle size={14} />
                  <p className="text-[10px] font-bold">Min. 3 karakter</p>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-purple-100 active:scale-[0.98] transition-all border border-purple-500"
            >
              <Send size={16} strokeWidth={3} /> Simpan Alasan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
