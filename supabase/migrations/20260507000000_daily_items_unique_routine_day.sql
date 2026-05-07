-- Unique constraint para permitir upsert en daily_items por rutina+día
-- Solo aplica cuando routine_id no es NULL (items generados desde rutinas)
create unique index daily_items_unique_routine_day
  on daily_items (user_id, routine_id, date)
  where routine_id is not null;
