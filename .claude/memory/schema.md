# Schema — Mi Día
Last synced: 2026-05-04
Source: supabase/migrations/*.sql

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

## Notes
- Todos los timestamps en UTC (timestamptz).
- daily_items se generan desde routines activas. No duplicar por día.
- status "not_sure" → mostrar advertencia médica, NUNCA sugerir repetir dosis.
- completed_at se registra SOLO cuando status = 'done'.
