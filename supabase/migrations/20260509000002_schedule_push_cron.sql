-- Requiere pg_cron habilitado en el proyecto Supabase
-- Invoca el Edge Function cada minuto vía pg_net
select cron.schedule(
  'send-due-reminders',
  '* * * * *',
  $$
  select net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-due-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
