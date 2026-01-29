
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

/**
 * SQL SCHEMA UNTUK SUPABASE SQL EDITOR:
 * Salin dan jalankan kode ini di SQL Editor Supabase Anda.
 * 
 * -- 1. TABEL PROFILES (Ekstensi dari auth.users)
 * create table if not exists public.profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   name text not null,
 *   email text not null,
 *   role text default 'user' check (role in ('user', 'admin', 'koordi')),
 *   voice_part text check (voice_part in ('Sopran', 'Alto', 'Tenor', 'Bass')),
 *   phone text,
 *   status text default 'pending' check (status in ('active', 'pending', 'rejected'))
 * );
 * 
 * -- 2. TABEL EVENTS
 * create table if not exists public.events (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   date timestamp with time zone not null,
 *   location text not null,
 *   description text,
 *   is_important boolean default false,
 *   category text default 'Latihan' check (category in ('Latihan', 'Pelayanan', 'Lainnya'))
 * );
 * 
 * -- 3. TABEL ATTENDANCE
 * create table if not exists public.attendance (
 *   user_id uuid references public.profiles(id) on delete cascade,
 *   event_id uuid references public.events(id) on delete cascade,
 *   status text not null check (status in ('present', 'absent', 'pending')),
 *   reason text,
 *   timestamp timestamp with time zone default now(),
 *   primary key (user_id, event_id)
 * );
 * 
 * -- 4. TABEL ANNOUNCEMENTS
 * create table if not exists public.announcements (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   content text not null,
 *   author_id uuid references public.profiles(id) on delete cascade,
 *   timestamp timestamp with time zone default now()
 * );
 * 
 * -- 5. TABEL APP SETTINGS (Untuk Logo & Konfigurasi Global)
 * create table if not exists public.app_settings (
 *   key text primary key,
 *   value text not null
 * );
 * 
 * -- 5a. Insert Logo URL (Jalankan ini untuk set logo)
 * insert into public.app_settings (key, value)
 * values ('app_logo_url', 'https://abcd1234.supabase.co/storage/v1/object/public/logos/app-logo.png')
 * on conflict (key) do update set value = excluded.value;
 * 
 * -- 5b. Enable Public Read Access for Settings
 * alter table public.app_settings enable row level security;
 * create policy "Allow public read access" on public.app_settings for select using (true);
 * 
 * -- 6. TRIGGER OTOMATIS PROFIL (Saat Auth Sign-Up)
 * create or replace function public.handle_new_user()
 * returns trigger as $$
 * declare
 *   v_role text;
 *   v_status text;
 * begin
 *   v_role := coalesce(new.raw_user_meta_data->>'role', 'user');
 *   v_status := case 
 *                 when v_role = 'admin' then 'active' 
 *                 else coalesce(new.raw_user_meta_data->>'status', 'pending') 
 *               end;
 *               
 *   insert into public.profiles (id, name, email, role, voice_part, phone, status)
 *   values (
 *     new.id,
 *     coalesce(new.raw_user_meta_data->>'name', 'Anggota Baru'),
 *     new.email,
 *     v_role,
 *     new.raw_user_meta_data->>'voice_part',
 *     new.raw_user_meta_data->>'phone',
 *     v_status
 *   );
 *   return new;
 * end;
 * $$ language plpgsql security definer;
 * 
 * drop trigger if exists on_auth_user_created on auth.users;
 * create trigger on_auth_user_created
 *   after insert on auth.users
 *   for each row execute procedure public.handle_new_user();
 */

export const supabaseUrl = process.env.SUPABASE_URL || 'https://mjumoowpjypshczjnlgp.supabase.co';
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdW1vb3dwanlwc2hjempubGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMDAxMTIsImV4cCI6MjA4NDc3NjExMn0.f4_gJ7ncejQ4KVejyyicFaEsdCKzogAAkusvOuceaVc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { createClient };