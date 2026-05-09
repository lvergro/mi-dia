-- Cron schedule migrado a GitHub Actions (*/5 * * * *)
-- Se elimina el job de pg_cron para evitar duplicados
select cron.unschedule('send-due-reminders');
