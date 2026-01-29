
import React, { useState, useRef } from 'react';
import { Plus, Megaphone, Shield, Users, ChevronRight, Upload, FileDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { EventFormModal } from '../components/CreateEventModal';
import { CreateAnnouncementModal } from '../components/CreateAnnouncementModal';
import { AdminMonitorModal } from '../components/AdminMonitorModal';
import { ChoirEvent, UserStatus, EventCategory } from '../types';

export const AdminPage = () => {
  const { state, addEvent, updateEvent, addAnnouncement } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedMonitorEvent, setSelectedMonitorEvent] = useState<ChoirEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChoirEvent | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const pendingCount = state.users.filter(u => u.status === UserStatus.PENDING).length;

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = (data: Omit<ChoirEvent, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
  };

  const downloadTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const headers = "Judul,Tanggal(YYYY-MM-DD),Jam(HH:MM),Lokasi,Deskripsi,Kategori(Latihan/Pelayanan/Lainnya),Penting(Ya/Tidak)";
    // Added quotes around location to show how to handle commas
    const example = 'Latihan Rutin,2025-10-25,19:30,"GPIB Pniel, Jakarta Pusat",Persiapan Minggu,Latihan,Ya';
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_jadwal_vos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Split by regex to handle both \r\n (Windows) and \n (Unix)
        const rows = text.split(/\r?\n/).slice(1);
        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          if (!row.trim()) continue; // Skip empty rows

          // Robust CSV parser: Split by comma ONLY if not inside quotes
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => {
             // Clean quotes if present (e.g. "Jakarta, Pusat" -> Jakarta, Pusat)
             let val = c.trim();
             if (val.startsWith('"') && val.endsWith('"')) {
                 val = val.slice(1, -1);
             }
             return val.trim();
          });

          if (cols.length < 4) {
            console.warn("Skipping invalid row:", row);
            errorCount++;
            continue;
          }

          // Mapping: 0:Judul, 1:Tanggal, 2:Jam, 3:Lokasi, 4:Deskripsi, 5:Kategori, 6:Penting
          const title = cols[0];
          const dateStr = cols[1]; // YYYY-MM-DD or MM/DD/YYYY
          const timeStr = cols[2]; // HH:MM
          const location = cols[3];
          const description = cols[4] || '';
          const categoryInput = cols[5] || 'Latihan';
          const isImportantInput = cols[6] || 'Ya';

          if (title && dateStr && timeStr && location) {
             try {
               // Construct Date: Handle formats like 3/30/2026 which fail with 'T' separator
               // Try generic join with space if T fails or if date contains slashes
               let combinedDateString = `${dateStr}T${timeStr}`;
               let dateObj = new Date(combinedDateString);

               // Fallback: If Invalid Date (often due to 'T' with slashes), try space separator
               if (isNaN(dateObj.getTime())) {
                  combinedDateString = `${dateStr} ${timeStr}`;
                  dateObj = new Date(combinedDateString);
               }

               // Check if Date is Valid
               if (isNaN(dateObj.getTime())) {
                 console.error(`Invalid date format for row: ${title}. Got: ${combinedDateString}`);
                 errorCount++;
                 continue;
               }

               const isoDate = dateObj.toISOString();
               
               // Normalize Category
               let category: EventCategory = 'Latihan';
               const catLower = categoryInput.toLowerCase();
               if (catLower.includes('pelayanan')) category = 'Pelayanan';
               else if (catLower.includes('lainnya')) category = 'Lainnya';

               // Normalize Important
               const isImportant = isImportantInput.toLowerCase() === 'ya' || isImportantInput.toLowerCase() === 'true';

               await addEvent({
                 title,
                 date: isoDate,
                 location,
                 description,
                 category,
                 isImportant
               });
               successCount++;
             } catch (err) {
               console.error("Error adding event row:", row, err);
               errorCount++;
             }
          } else {
            errorCount++;
          }
        }

        let message = `Berhasil mengimport ${successCount} jadwal.`;
        if (errorCount > 0) {
          message += `\n${errorCount} baris gagal (cek format tanggal/waktu di console).`;
        }
        alert(message);
        
      } catch (error) {
        alert('Gagal memproses file CSV. Pastikan format sesuai template.');
        console.error(error);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-24 lg:pb-8 bg-slate-50 min-h-screen">
      <div className="sticky lg:static top-0 z-40 bg-white/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-none border-purple-100 shadow-sm lg:shadow-none">
        <div className="pt-5 pb-4 px-6 lg:px-0">
          <h2 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight">Kontrol</h2>
          <p className="text-purple-600/60 text-[9px] lg:text-[11px] font-black tracking-[0.2em] mt-1 uppercase">VOS Control Panel</p>
        </div>
      </div>

      <main className="px-6 lg:px-0 py-6 space-y-8">
        
        {/* MENU GRID */}
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* 1. MANAJEMEN ANGGOTA */}
            <button 
              onClick={() => navigate('/admin/members')}
              className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-lg hover:border-purple-200 text-left group transition-all relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 shrink-0 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[15px] text-slate-900 leading-none">Manajemen Anggota</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Database & Persetujuan</p>
                {pendingCount > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span className="text-[8px] font-black uppercase tracking-widest">{pendingCount} Pending</span>
                  </div>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </button>

            {/* 2. JADWAL BARU */}
            <button onClick={handleCreateEvent} className="p-6 bg-purple-600 text-white rounded-3xl flex items-center gap-5 shadow-xl shadow-purple-100 hover:bg-purple-700 text-left group transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center transition-transform shrink-0 group-hover:rotate-90">
                 <Plus size={24} strokeWidth={3} />
              </div>
              <div>
                <p className="font-black text-[15px] leading-none">Jadwal Baru</p>
                <p className="text-[9px] text-white/60 font-bold uppercase mt-1 tracking-wider">Latihan/Tugas</p>
              </div>
            </button>

            {/* 3. PENGUMUMAN */}
            <button onClick={() => setIsAnnouncementModalOpen(true)} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-lg hover:border-purple-200 text-left group transition-all">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
                 <Megaphone size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-black text-[15px] text-slate-900 leading-none">Pengumuman</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Broadcast Info</p>
              </div>
            </button>

            {/* 4. IMPORT JADWAL CSV */}
            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-lg hover:border-blue-200 text-left group transition-all relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 disabled:opacity-50"
              >
                 {isImporting ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} strokeWidth={2.5} />}
              </button>
              <div className="flex-1">
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <p className="font-black text-[15px] text-slate-900 leading-none">Import Jadwal</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Upload CSV</p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="mt-2 flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  <FileDown size={10} /> Template CSV
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm text-center">
          <Shield size={48} className="mx-auto mb-4 text-purple-200" />
          <h3 className="text-xl font-black text-slate-900">Keamanan & Akses</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2">Data anggota bersifat internal VOS. Pastikan koordinasi pendaftaran user baru melalui pengurus inti.</p>
        </div>
      </main>

      <EventFormModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSubmit={handleEventSubmit} initialData={editingEvent} />
      <CreateAnnouncementModal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} onSubmit={(title, content) => addAnnouncement(title, content)} />
      <AdminMonitorModal event={selectedMonitorEvent} onClose={() => setSelectedMonitorEvent(null)} attendance={state.attendance} users={state.users} />
    </div>
  );
};
