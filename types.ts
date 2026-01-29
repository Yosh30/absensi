
export enum VoicePart {
  SOPRAN = 'Sopran',
  ALTO = 'Alto',
  TENOR = 'Tenor',
  BASS = 'Bass'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  KOORDI = 'koordi'
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REJECTED = 'rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for login
  role: UserRole;
  voicePart: VoicePart;
  phone: string;
  status: UserStatus;
}

export interface Attendance {
  userId: string;
  eventId: string;
  status: 'present' | 'absent' | 'pending';
  reason?: string;
  timestamp: number;
}

export type EventCategory = 'Latihan' | 'Pelayanan' | 'Lainnya';

export interface ChoirEvent {
  id: string;
  title: string;
  date: string; // ISO format
  location: string;
  description: string;
  isImportant: boolean;
  category: EventCategory;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  events: ChoirEvent[];
  attendance: Attendance[];
  announcements: Announcement[];
  appLogoUrl?: string | null;
}