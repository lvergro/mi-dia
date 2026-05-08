# Schema — Mi Día
Last synced: 2026-05-08
Source: supabase/migrations/*.sql
Migration: supabase/migrations/20260504000000_initial_schema.sql
Migration: supabase/migrations/20260508120000_items_logs_schema.sql

## Tables

medications:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - name (text, not null)
    - dose (text, nullable)
    - instructions (text, nullable)
    - active (bool, default: true)
  timestamps: true (created_at, updated_at)
  rls: user_id = auth.uid()

routines:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - medication_id (uuid, fk: medications, nullable)
    - type (text, not null, enum: medication|procedure|self_care)
    - title (text, not null)
    - scheduled_time (time, nullable)
    - time_block (text, nullable, enum: morning|afternoon|night)
    - active (bool, default: true)
  timestamps: true (created_at, updated_at)
  rls: user_id = auth.uid()

daily_items:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - routine_id (uuid, fk: routines, nullable)
    - date (date, not null)
    - title (text, not null)
    - type (text, not null)
    - scheduled_time (time, nullable)
    - status (text, default: 'pending', enum: pending|done|skipped|not_sure)
    - completed_at (timestamptz, nullable)
    - notes (text, nullable)
  timestamps: true (created_at, updated_at)
  indexes: [(user_id, date)]
  rls: user_id = auth.uid()

daily_notes:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - date (date, not null)
    - content (text, not null)
  timestamps: true (created_at, updated_at — no deleted_at en MVP)
  indexes: [(user_id, date)]
  rls: user_id = auth.uid()

items:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - type (text, not null, enum: medication|activity)
    - name (text, not null)
    - dose (text, nullable)
    - specific_time (time, not null)
    - recurrence_type (text, not null, enum: daily|specific_days)
    - recurrence_days (integer[], nullable — lun=1..dom=7)
    - deleted_at (timestamptz, nullable — soft-delete)
  timestamps: true (created_at, updated_at)
  indexes: [items_user_active_idx ON (user_id) WHERE deleted_at IS NULL]
  rls: user_id = auth.uid()

logs:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - item_id (uuid, fk: items, not null)
    - date (date, not null)
    - status (text, not null, enum: done|omitted)
    - note (text, nullable)
    - completed_at (timestamptz, not null, default: now())
  timestamps: true (created_at)
  unique: (user_id, item_id, date)
  indexes: [logs_user_date_idx ON (user_id, date)]
  rls: user_id = auth.uid()

notification_logs:
  pk: id (uuid, default: gen_random_uuid())
  cols:
    - user_id (uuid, fk: auth.users, not null)
    - item_id (uuid, fk: items, not null)
    - scheduled_at (timestamptz, not null)
    - sent_at (timestamptz, nullable)
    - status (text, not null, enum: sent|cancelled|failed)
    - error (text, nullable)
  timestamps: true (created_at)
  indexes: [notification_logs_user_item_idx ON (user_id, item_id, scheduled_at)]
  rls: user_id = auth.uid()

## Constraints
- daily_items: CHECK `(status = 'done' AND completed_at IS NOT NULL) OR (status <> 'done' AND completed_at IS NULL)`
- routines.type: CHECK IN ('medication', 'procedure', 'self_care')
- daily_items.type: CHECK IN ('medication', 'procedure', 'self_care')
- daily_items.status: CHECK IN ('pending', 'done', 'skipped', 'not_sure')
- routines.time_block: CHECK IN ('morning', 'afternoon', 'night')
- items.type: CHECK IN ('medication', 'activity')
- items.recurrence_type: CHECK IN ('daily', 'specific_days')
- logs.status: CHECK IN ('done', 'omitted')
- notification_logs.status: CHECK IN ('sent', 'cancelled', 'failed')

## Notes
- Todos los timestamps en UTC (timestamptz).
- daily_items se generan desde routines activas. No duplicar por día.
- status "not_sure" → mostrar advertencia médica, NUNCA sugerir repetir dosis.
- completed_at se registra SOLO cuando status = 'done'.
