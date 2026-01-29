
import { AppState, UserRole, VoicePart, ChoirEvent, User, Announcement, Attendance, UserStatus } from './types';

// Initial Mock Data
// Added missing status: UserStatus.ACTIVE to satisfy User interface requirement
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin VOS', email: 'admin@vos.com', password: 'admin', role: UserRole.ADMIN, voicePart: VoicePart.TENOR, phone: '08123456789', status: UserStatus.ACTIVE },
  { id: '2', name: 'Yoshua Tenor', email: 'yoshua@mail.com', password: 'user123', role: UserRole.USER, voicePart: VoicePart.TENOR, phone: '08122223333', status: UserStatus.ACTIVE },
  { id: '3', name: 'Ani Alto', email: 'ani@mail.com', password: 'user123', role: UserRole.USER, voicePart: VoicePart.ALTO, phone: '08144445555', status: UserStatus.ACTIVE },
  { id: '4', name: 'Catur Bass', email: 'catur@mail.com', password: 'user123', role: UserRole.USER, voicePart: VoicePart.BASS, phone: '08166667777', status: UserStatus.ACTIVE },
  // Soprano Users (5)
  { id: 's1', name: 'Siti Soprano', email: 'siti@mail.com', role: UserRole.USER, voicePart: VoicePart.SOPRAN, phone: '08100000001', status: UserStatus.ACTIVE },
  { id: 's2', name: 'Sarah Soprano', email: 'sarah@mail.com', role: UserRole.USER, voicePart: VoicePart.SOPRAN, phone: '08100000002', status: UserStatus.ACTIVE },
  { id: 's3', name: 'Siska Soprano', email: 'siska@mail.com', role: UserRole.USER, voicePart: VoicePart.SOPRAN, phone: '08100000003', status: UserStatus.ACTIVE },
  { id: 's4', name: 'Santi Soprano', email: 'santi@mail.com', role: UserRole.USER, voicePart: VoicePart.SOPRAN, phone: '08100000004', status: UserStatus.ACTIVE },
  { id: 's5', name: 'Sheila Soprano', email: 'sheila@mail.com', role: UserRole.USER, voicePart: VoicePart.SOPRAN, phone: '08100000005', status: UserStatus.ACTIVE },
  // Alto Users (4 more + Ani = 5)
  { id: 'a1', name: 'Amel Alto', email: 'amel@mail.com', role: UserRole.USER, voicePart: VoicePart.ALTO, phone: '08100000006', status: UserStatus.ACTIVE },
  { id: 'a2', name: 'Alya Alto', email: 'alya@mail.com', role: UserRole.USER, voicePart: VoicePart.ALTO, phone: '08100000007', status: UserStatus.ACTIVE },
  { id: 'a3', name: 'Agnes Alto', email: 'agnes@mail.com', role: UserRole.USER, voicePart: VoicePart.ALTO, phone: '08100000008', status: UserStatus.ACTIVE },
  { id: 'a4', name: 'Alin Alto', email: 'alin@mail.com', role: UserRole.USER, voicePart: VoicePart.ALTO, phone: '08100000009', status: UserStatus.ACTIVE },
  // Tenor Users (3 more + Admin + Yoshua = 5)
  { id: 't1', name: 'Tono Tenor', email: 'tono@mail.com', role: UserRole.USER, voicePart: VoicePart.TENOR, phone: '08100000010', status: UserStatus.ACTIVE },
  { id: 't2', name: 'Tedy Tenor', email: 'tedy@mail.com', role: UserRole.USER, voicePart: VoicePart.TENOR, phone: '08100000011', status: UserStatus.ACTIVE },
  { id: 't3', name: 'Titus Tenor', email: 'titus@mail.com', role: UserRole.USER, voicePart: VoicePart.TENOR, phone: '08100000012', status: UserStatus.ACTIVE },
  // Bass Users (4 more + Catur = 5)
  { id: 'b1', name: 'Bambang Bass', email: 'bambang@mail.com', role: UserRole.USER, voicePart: VoicePart.BASS, phone: '08100000013', status: UserStatus.ACTIVE },
  { id: 'b2', name: 'Beni Bass', email: 'beni@mail.com', role: UserRole.USER, voicePart: VoicePart.BASS, phone: '08100000014', status: UserStatus.ACTIVE },
  { id: 'b3', name: 'Berto Bass', email: 'berto@mail.com', role: UserRole.USER, voicePart: VoicePart.BASS, phone: '08100000015', status: UserStatus.ACTIVE },
  { id: 'b4', name: 'Bagus Bass', email: 'bagus@mail.com', role: UserRole.USER, voicePart: VoicePart.BASS, phone: '08100000016', status: UserStatus.ACTIVE },
];

const INITIAL_EVENTS: ChoirEvent[] = [
  { 
    id: 'e2', 
    title: 'Pelayanan Mingguan', 
    date: '2026-01-25T10:00:00', 
    location: 'GMIM Imanuel, Jakarta Barat', 
    description: 'Tugas pelayanan mingguan koor Voice of Soul.', 
    isImportant: true,
    category: 'Pelayanan'
  },
  { 
    id: 'e1', 
    title: 'Latihan Rutin Mingguan', 
    date: '2026-01-27T19:30:00', 
    location: 'GPIB Pniel, Jakarta Pusat', 
    description: 'Latihan rutin mingguan untuk mengasah vokal dan pembawaan lagu baru.', 
    isImportant: true,
    category: 'Latihan'
  },
  { 
    id: 'e4', 
    title: 'Latihan Rutin Mingguan', 
    date: '2026-02-03T19:30:00', 
    location: 'GPIB Pniel, Jakarta Pusat', 
    description: 'Latihan rutin mingguan.', 
    isImportant: false,
    category: 'Latihan'
  },
  { 
    id: 'e5', 
    title: 'Latihan Rutin Mingguan', 
    date: '2026-02-05T19:30:00', 
    location: 'GPIB Pniel, Jakarta Pusat', 
    description: 'Latihan rutin mingguan.', 
    isImportant: false,
    category: 'Latihan'
  },
  { 
    id: 'e6', 
    title: 'Pelayanan Mingguan', 
    date: '2026-02-08T13:00:00', 
    location: 'GPIB Tampan, Jakarta Timur', 
    description: 'Pelayanan Koor Voice of Soul di GPIB Tampan.', 
    isImportant: true,
    category: 'Pelayanan'
  },
  { 
    id: 'e3', 
    title: 'Latihan Rutin Mingguan', 
    date: '2027-01-28T19:30:00', 
    location: 'GPIB Pniel, Jakarta Pusat', 
    description: 'Latihan rutin mingguan.', 
    isImportant: false,
    category: 'Latihan'
  },
];

const INITIAL_ATTENDANCE: Attendance[] = [
  // Event e2 (25 Jan) - 5 Present for each part
  // Sopranos
  { userId: 's1', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 's2', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 's3', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 's4', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 's5', eventId: 'e2', status: 'present', timestamp: Date.now() },
  // Altos
  { userId: '3', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'a1', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'a2', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'a3', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'a4', eventId: 'e2', status: 'present', timestamp: Date.now() },
  // Tenors
  { userId: '1', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: '2', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 't1', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 't2', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 't3', eventId: 'e2', status: 'present', timestamp: Date.now() },
  // Basses
  { userId: '4', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'b1', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'b2', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'b3', eventId: 'e2', status: 'present', timestamp: Date.now() },
  { userId: 'b4', eventId: 'e2', status: 'present', timestamp: Date.now() },

  // Event e1 (27 Jan) - Some Izin (Absent)
  { userId: 's1', eventId: 'e1', status: 'absent', reason: 'Ada urusan keluarga mendadak', timestamp: Date.now() },
  { userId: 's2', eventId: 'e1', status: 'absent', reason: 'Sakit flu berat', timestamp: Date.now() },
  { userId: 'a1', eventId: 'e1', status: 'absent', reason: 'Lembur kantor', timestamp: Date.now() },
  { userId: 't1', eventId: 'e1', status: 'absent', reason: 'Perjalanan dinas ke luar kota', timestamp: Date.now() },
  { userId: 'b1', eventId: 'e1', status: 'absent', reason: 'Acara pernikahan saudara', timestamp: Date.now() },
  { userId: 'b2', eventId: 'e1', status: 'absent', reason: 'Keluarga sakit', timestamp: Date.now() },
  
  // Others present for e1
  { userId: 's3', eventId: 'e1', status: 'present', timestamp: Date.now() },
  { userId: '3', eventId: 'e1', status: 'present', timestamp: Date.now() },
  { userId: '2', eventId: 'e1', status: 'present', timestamp: Date.now() },
  { userId: '4', eventId: 'e1', status: 'present', timestamp: Date.now() },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { 
    id: 'a1', 
    title: 'Seragam Konser VOS', 
    content: 'Diberitahukan kepada seluruh anggota VOS, seragam untuk konser mendatang adalah Jas Hitam dengan aksen Ungu.', 
    author: 'Admin', 
    timestamp: Date.now() 
  }
];

export const loadState = (): AppState => {
  const saved = localStorage.getItem('vos_app_state');
  if (saved) {
      try {
          const parsed = JSON.parse(saved);
          // Migrasi data lama jika category belum ada
          parsed.events = parsed.events.map((e: any) => ({
              ...e,
              category: e.category || (e.title.toLowerCase().includes('latihan') ? 'Latihan' : e.title.toLowerCase().includes('pelayanan') ? 'Pelayanan' : 'Lainnya')
          }));
          return parsed;
      } catch (e) {
          return {
            currentUser: null,
            users: INITIAL_USERS,
            events: INITIAL_EVENTS,
            attendance: INITIAL_ATTENDANCE,
            announcements: INITIAL_ANNOUNCEMENTS,
            appLogoUrl: null,
          };
      }
  }
  return {
    currentUser: null,
    users: INITIAL_USERS,
    events: INITIAL_EVENTS,
    attendance: INITIAL_ATTENDANCE,
    announcements: INITIAL_ANNOUNCEMENTS,
    appLogoUrl: null,
  };
};

export const saveState = (state: AppState) => {
  localStorage.setItem('vos_app_state', JSON.stringify(state));
};