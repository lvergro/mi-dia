-- Wave 1: items, logs, notification_logs
-- Refs: LUI-84

-- ============================================================
-- TABLE: items
-- ============================================================
CREATE TABLE items (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type             text        NOT NULL CHECK (type IN ('medication', 'activity')),
  name             text        NOT NULL,
  dose             text,
  specific_time    time        NOT NULL,
  recurrence_type  text        NOT NULL CHECK (recurrence_type IN ('daily', 'specific_days')),
  recurrence_days  integer[],
  deleted_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY items_select ON items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY items_insert ON items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY items_update ON items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY items_delete ON items FOR DELETE USING (user_id = auth.uid());

CREATE INDEX items_user_active_idx ON items(user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: logs
-- ============================================================
CREATE TABLE logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id       uuid        NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  date          date        NOT NULL,
  status        text        NOT NULL CHECK (status IN ('done', 'omitted')),
  note          text,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT logs_user_item_date_uq UNIQUE (user_id, item_id, date)
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY logs_select ON logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY logs_insert ON logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY logs_update ON logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY logs_delete ON logs FOR DELETE USING (user_id = auth.uid());

CREATE INDEX logs_user_date_idx ON logs(user_id, date);

-- ============================================================
-- TABLE: notification_logs
-- ============================================================
CREATE TABLE notification_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id       uuid        NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  scheduled_at  timestamptz NOT NULL,
  sent_at       timestamptz,
  status        text        NOT NULL CHECK (status IN ('sent', 'cancelled', 'failed')),
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_logs_select ON notification_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notification_logs_insert ON notification_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY notification_logs_update ON notification_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY notification_logs_delete ON notification_logs FOR DELETE USING (user_id = auth.uid());

CREATE INDEX notification_logs_user_item_idx ON notification_logs(user_id, item_id, scheduled_at);
