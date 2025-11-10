-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule trial reminders to run daily at 09:00 AM
SELECT cron.schedule(
  'send-trial-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
      url:='https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/send-trial-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule trial expiration check to run daily at 11:00 PM
SELECT cron.schedule(
  'check-trial-expiration-daily',
  '0 23 * * *',
  $$
  SELECT net.http_post(
      url:='https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/check-trial-expiration',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;
  $$
);