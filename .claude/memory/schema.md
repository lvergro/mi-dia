# Schema — Mi Día
Last synced: 2026-05-11
Source: supabase/migrations/*.sql

## Tables

medications:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), name (text, not null), dose (text, nullable), instructions (text, nullable), active (bool, default: true)]
  timestamps: true
  rls: user_id = auth.uid()

routines:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), medication_id (uuid, fk: medications, nullable), type (text, enum: medication|procedure|self_care), title (text, not null), scheduled_time (time, nullable), time_block (text, enum: morning|afternoon|night, nullable), active (bool, default: true)]
  timestamps: true
  rls: user_id = auth.uid()

daily_items:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), routine_id (uuid, fk: routines, nullable), date (date, not null), title (text, not null), type (text, enum: medication|procedure|self_care), scheduled_time (time, nullable), status (text, default: pending, enum: pending|done|skipped|not_sure), completed_at (timestamptz, nullable), notes (text, nullable)]
  timestamps: true
  indexes: [(user_id, date)]
  rls: user_id = auth.uid()

items:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), type (text, enum: medication|activity), name (text, not null), dose (text, nullable), specific_time (time, not null), recurrence_type (text, enum: daily|specific_days), recurrence_days (int[], nullable), deleted_at (timestamptz, nullable)]
  timestamps: true
  indexes: [items_user_active_idx ON (user_id) WHERE deleted_at IS NULL]
  rls: user_id = auth.uid()

logs:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), item_id (uuid, fk: items, not null), date (date, not null), status (text, enum: done|omitted), note (text, nullable), completed_at (timestamptz, not null)]
  timestamps: true (created_at)
  unique: (user_id, item_id, date)
  indexes: [(user_id, date)]
  rls: user_id = auth.uid()

notification_logs:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), item_id (uuid, fk: items, not null), scheduled_at (timestamptz, not null), sent_at (timestamptz, nullable), status (text, enum: sent|cancelled|failed), error (text, nullable)]
  timestamps: true (created_at)
  indexes: [(user_id, item_id, scheduled_at)]
  rls: user_id = auth.uid()

push_tokens:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null, unique), expo_token (text, not null), platform (text, default: android)]
  timestamps: true
  rls: user_id = auth.uid()

daily_moods:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), date (date, not null), mood (int, check: 1-5), note (text, nullable)]
  timestamps: true
  unique: (user_id, date)
  rls: user_id = auth.uid()

daily_notes:
  pk: id (uuid)
  cols: [user_id (uuid, fk: auth.users, not null), content (text, not null), date (date, not null), mood (int, check: 1-5, nullable)]
  timestamps: true (created_at)
  indexes: [(user_id, date)]
  rls: user_id = auth.uid()

## Functions
- delete_account(): void — SECURITY DEFINER, deletes auth.users row for auth.uid(), granted to authenticated

## Notes
- Todos los timestamps en UTC (timestamptz).
- daily_items se generan desde routines activas. No duplicar por día.
- status "not_sure" → mostrar advertencia médica, NUNCA sugerir repetir dosis.
- completed_at se registra SOLO cuando status = 'done'.
