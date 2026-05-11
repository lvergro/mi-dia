alter table public.daily_notes
  add column if not exists mood integer check (mood between 1 and 5);
