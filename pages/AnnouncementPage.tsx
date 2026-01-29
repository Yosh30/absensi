
import React, { useState } from 'react';
import { useApp } from '../App';
import { Megaphone, Edit2, Trash2, Clock, User, Calendar, AlertTriangle, X } from 'lucide-react';
import { UserRole, Announcement } from '../types';
import { CreateAnnouncementModal } from '../components/CreateAnnouncementModal';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Hapus Info?</h3>
        <p className="text-slate-500 text-[13px] leading-relaxed mb-8">
          Apakah Anda yakin ingin menghapus <span className="font-black text-slate-900">"{title}"</span>? Tindakan ini akan menghapus data secara permanen dari database.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
            Batal
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-[2] bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-red-100 border border-red-500"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export const AnnouncementPage = () => {
  const { state, updateAnnouncement, deleteAnnouncement } = useApp();
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annToDelete, setAnnToDelete] = useState<Announcement | null>(null);
  
  const isAdmin = state.currentUser?.role === UserRole.ADMIN;

  const handleEdit = (ann: Announcement) => {
    setEditingAnn(ann);
  };

  const handleDeleteClick = (ann: Announcement) => {
    setAnnToDelete(ann);
  };

  const handleConfirmDelete = async () => {
    if (annToDelete) {
      try {
        await deleteAnnouncement(annToDelete.id);
        setAnnToDelete(null);
      } catch (err) {
        alert('Gagal menghapus pengumuman dari database.');
      }
    }
  };

  const handleUpdateSubmit = async (title: string, content: string) => {
    if (editingAnn) {
      try {
        await updateAnnouncement(editingAnn.id, title, content);
        setEditingAnn(null);
      } catch (err) {
        alert('Gagal memperbarui pengumuman ke database.');
      }
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return { date: dateStr, time: timeStr };
  };

  return (
    <div className="pb-24 lg:pb-8 min-h-screen bg-slate-50">
      {/* COMPACT FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm lg:static lg:bg-transparent lg:border-none lg:shadow-none">
        <div className="bg-white lg:bg-transparent pt-5 pb-3 px-6 lg:px-0">
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">Informasi</h2>
          <p className="text-purple-600/60 text-[8px] lg:text-[11px] font-black tracking-[0.2em] mt-0.5 uppercase">Update & Pengumuman Terbaru</p>
        </div>
      </div>

      <main className="px-6 lg:px-0 space-y-4 pt-20 lg:pt-4">
        {state.announcements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Megaphone className="mx-auto mb-4 opacity-20" size={64} />
            <p className="text-[11px] lg:text-[13px] font-black text-slate-400 uppercase tracking-widest">Belum ada informasi terbaru</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {state.announcements.map(ann => {
              const dt = formatDateTime(ann.timestamp);
              return (
                <div key={ann.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                  <div className="p-6 flex-1">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-100 shrink-0 group-hover:scale-105 transition-transform">
                        <Megaphone size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight line-clamp-2">{ann.title}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                           <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             <User size={12} className="text-purple-600" /> {ann.author}
                           </div>
                           <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             <Calendar size={12} className="text-purple-600" /> {dt.date}
                           </div>
                           <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             <Clock size={12} className="text-purple-600" /> {dt.time} WIB
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-slate-50 w-full mb-5" />
                    <p className="text-slate-600 leading-relaxed text-[13px] lg:text-[14px] font-medium whitespace-pre-wrap">{ann.content}</p>
                  </div>
                  
                  {isAdmin && (
                    <div className="px-6 pb-6 mt-auto">
                      <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-50">
                        <button 
                          onClick={() => handleEdit(ann)}
                          className="py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-100 border border-blue-500"
                        >
                          <Edit2 size={16} strokeWidth={3} /> Ubah
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(ann)}
                          className="py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-100 border border-red-500"
                        >
                          <Trash2 size={16} strokeWidth={3} /> Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CreateAnnouncementModal 
        isOpen={!!editingAnn} 
        onClose={() => setEditingAnn(null)} 
        onSubmit={handleUpdateSubmit} 
        initialData={editingAnn ? { id: editingAnn.id, title: editingAnn.title, content: editingAnn.content } : null} 
      />

      <DeleteConfirmModal 
        isOpen={!!annToDelete} 
        onClose={() => setAnnToDelete(null)} 
        onConfirm={handleConfirmDelete} 
        title={annToDelete?.title || ''} 
      />
    </div>
  );
};
