-- Tabla daily_moods: registra el ánimo y nota del día por usuario
create table if not exists public.daily_moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  mood integer not null check (mood between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_moods_user_date_unique unique (user_id, date)
);

-- Trigger updated_at
do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'daily_moods_updated_at'
  ) then
    create trigger daily_moods_updated_at
      before update on public.daily_moods
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- RLS
alter table public.daily_moods enable row level security;

create policy "Users manage own daily moods"
  on public.daily_moods
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
