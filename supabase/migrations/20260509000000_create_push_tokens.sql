-- Tabla push_tokens: un token por usuario (upsert por user_id)
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_token text not null,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_tokens_user_unique unique (user_id)
);

-- Trigger updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Solo crear si no existe (puede ya existir de otras tablas)
do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'push_tokens_updated_at'
  ) then
    create trigger push_tokens_updated_at
      before update on public.push_tokens
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- RLS
alter table public.push_tokens enable row level security;

create policy "Users manage own push token"
  on public.push_tokens
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
