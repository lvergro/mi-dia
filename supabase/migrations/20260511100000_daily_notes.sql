create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists daily_notes_user_date_idx on public.daily_notes (user_id, date);

alter table public.daily_notes enable row level security;

create policy "Users manage own daily notes"
  on public.daily_notes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
