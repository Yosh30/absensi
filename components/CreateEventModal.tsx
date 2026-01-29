
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Bell, AlignLeft } from 'lucide-react';
import { EventCategory, ChoirEvent } from '../types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<ChoirEvent, 'id'>) => void;
  initialData?: ChoirEvent | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [dateOnly, setDateOnly] = useState('');
  const [timeOnly, setTimeOnly] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Latihan');
  const [isImportant, setIsImportant] = useState(true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      const d = new Date(initialData.date);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDateOnly(`${year}-${month}-${day}`);
      
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setTimeOnly(`${hours}:${minutes}`);

      setLocation(initialData.location);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
      setIsImportant(initialData.isImportant);
    } else {
      setTitle('');
      setDateOnly('');
      setTimeOnly('19:30'); 
      setLocation('');
      setDescription('');
      setCategory('Latihan');
      setIsImportant(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateOnly || !timeOnly || !location) return;
    
    const combinedDate = new Date(`${dateOnly}T${timeOnly}`);
    
    onSubmit({
      title,
      date: combinedDate.toISOString(),
      location,
      description,
      category,
      isImportant,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[95vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {initialData ? 'Edit Jadwal' : 'Buat Jadwal Baru'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Latihan atau Pelayanan</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Kegiatan</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Latihan Rutin"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                  <Calendar size={18} />
                </div>
                <input 
                  required 
                  type="date" 
                  value={dateOnly} 
                  onChange={(e) => setDateOnly(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm cursor-pointer block" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam (WIB)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                  <Clock size={18} />
                </div>
                <input 
                  required 
                  type="time" 
                  value={timeOnly} 
                  onChange={(e) => setTimeOnly(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm cursor-pointer block" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-xs appearance-none">
                <option value="Latihan">Latihan</option>
                <option value="Pelayanan">Pelayanan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penting?</label>
              <button type="button" onClick={() => setIsImportant(!isImportant)}
                className={`w-full p-4 border rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs ${
                  isImportant ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Bell size={16} fill={isImportant ? 'currentColor' : 'none'} /> {isImportant ? 'Penting' : 'Normal'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <MapPin size={18} />
              </div>
              <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lokasi kegiatan..."
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Kegiatan</label>
            <div className="relative">
              <div className="absolute left-4 top-4 text-slate-400 pointer-events-none">
                <AlignLeft size={18} />
              </div>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Tambahkan detail kegiatan (opsional)..."
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all font-bold text-sm resize-none h-24" 
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-100 active:scale-[0.98] transition-all mt-4 border border-purple-500">
            {initialData ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
          </button>
        </form>
      </div>
    </div>
  );
};
