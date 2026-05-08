-- Add unique constraint required by upsertDailyItems (onConflict: "user_id,routine_id,date")
-- Without this, PostgreSQL throws on any upsert attempt, preventing daily items from being generated.
alter table daily_items
  add constraint daily_items_user_routine_date_key
  unique (user_id, routine_id, date);
