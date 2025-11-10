-- Remove old cron jobs with placeholder key
SELECT cron.unschedule('send-trial-reminders-daily');
SELECT cron.unschedule('check-trial-expiration-daily');

-- Schedule trial reminders to run daily at 09:00 AM (with correct key)
SELECT cron.schedule(
  'send-trial-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
      url:='https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/send-trial-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWtkbW1uYWp6ZXZvdXBnZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTY1NjEsImV4cCI6MjA2MDI3MjU2MX0.b-Vf2q8nQ7mbhehpA_SJ27gpvu7KgWCV9tNxUKsWRa4"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule trial expiration check to run daily at 11:00 PM (with correct key)
SELECT cron.schedule(
  'check-trial-expiration-daily',
  '0 23 * * *',
  $$
  SELECT net.http_post(
      url:='https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/check-trial-expiration',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWtkbW1uYWp6ZXZvdXBnZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTY1NjEsImV4cCI6MjA2MDI3MjU2MX0.b-Vf2q8nQ7mbhehpA_SJ27gpvu7KgWCV9tNxUKsWRa4"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;
  $$
);