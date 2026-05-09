create or replace function public.get_due_items_for_push(
  p_time_window text,   -- 'HH:MM'
  p_today date,
  p_schema_day integer, -- 1=lun..7=dom
  p_scheduled_at timestamptz
)
returns table (
  item_id uuid,
  user_id uuid,
  name text,
  dose text,
  expo_token text,
  scheduled_at timestamptz
)
language sql
security definer
as $$
  select
    i.id as item_id,
    i.user_id,
    i.name,
    i.dose,
    pt.expo_token,
    p_scheduled_at as scheduled_at
  from public.items i
  join public.push_tokens pt on pt.user_id = i.user_id
  where
    i.deleted_at is null
    and to_char(i.specific_time, 'HH24:MI') = p_time_window
    and (
      i.recurrence_type = 'daily'
      or (i.recurrence_type = 'specific_days' and p_schema_day = any(i.recurrence_days))
    )
    -- No existe log done/omitted hoy
    and not exists (
      select 1 from public.logs l
      where l.item_id = i.id
        and l.user_id = i.user_id
        and l.date = p_today
    )
    -- Idempotencia: no existe notification_log para este scheduled_at
    and not exists (
      select 1 from public.notification_logs nl
      where nl.item_id = i.id
        and nl.user_id = i.user_id
        and nl.scheduled_at = p_scheduled_at
    );
$$;
