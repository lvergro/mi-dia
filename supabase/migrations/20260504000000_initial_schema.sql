-- ============================================================
-- Mi Día — Initial Schema Migration
-- ============================================================

-- ============================================================
-- medications
-- ============================================================
create table medications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  dose         text,
  instructions text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table medications enable row level security;

create policy "medications: owner select"
  on medications for select
  using (user_id = auth.uid());

create policy "medications: owner insert"
  on medications for insert
  with check (user_id = auth.uid());

create policy "medications: owner update"
  on medications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "medications: owner delete"
  on medications for delete
  using (user_id = auth.uid());

-- ============================================================
-- routines
-- ============================================================
create table routines (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  medication_id   uuid references medications(id) on delete set null,
  type            text not null check (type in ('medication', 'procedure', 'self_care')),
  title           text not null,
  scheduled_time  time,
  time_block      text check (time_block in ('morning', 'afternoon', 'night')),
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table routines enable row level security;

create policy "routines: owner select"
  on routines for select
  using (user_id = auth.uid());

create policy "routines: owner insert"
  on routines for insert
  with check (user_id = auth.uid());

create policy "routines: owner update"
  on routines for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "routines: owner delete"
  on routines for delete
  using (user_id = auth.uid());

-- ============================================================
-- daily_items
-- ============================================================
create table daily_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  routine_id     uuid references routines(id) on delete set null,
  date           date not null,
  title          text not null,
  type           text not null check (type in ('medication', 'procedure', 'self_care')),
  scheduled_time time,
  status         text not null default 'pending'
                   check (status in ('pending', 'done', 'skipped', 'not_sure')),
  completed_at   timestamptz,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- completed_at must be set if and only if status = 'done'
  constraint completed_at_only_when_done
    check (
      (status = 'done' and completed_at is not null) or
      (status <> 'done' and completed_at is null)
    )
);

create index daily_items_user_date_idx on daily_items (user_id, date);

alter table daily_items enable row level security;

create policy "daily_items: owner select"
  on daily_items for select
  using (user_id = auth.uid());

create policy "daily_items: owner insert"
  on daily_items for insert
  with check (user_id = auth.uid());

create policy "daily_items: owner update"
  on daily_items for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "daily_items: owner delete"
  on daily_items for delete
  using (user_id = auth.uid());

-- ============================================================
-- daily_notes
-- ============================================================
create table daily_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daily_notes_user_date_idx on daily_notes (user_id, date);

alter table daily_notes enable row level security;

create policy "daily_notes: owner select"
  on daily_notes for select
  using (user_id = auth.uid());

create policy "daily_notes: owner insert"
  on daily_notes for insert
  with check (user_id = auth.uid());

create policy "daily_notes: owner update"
  on daily_notes for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "daily_notes: owner delete"
  on daily_notes for delete
  using (user_id = auth.uid());
