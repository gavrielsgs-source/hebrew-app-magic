-- יצירת Cron job לבדיקת טוקנים של פייסבוק כל יום
-- הפעלת הרחבות נדרשות
SELECT cron.schedule(
  'facebook-token-check',
  '0 8 * * *', -- כל יום ב-8:00 בבוקר
  $$
  SELECT
    net.http_post(
        url:='https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/check-facebook-tokens',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWtkbW1uYWp6ZXZvdXBnZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTY1NjEsImV4cCI6MjA2MDI3MjU2MX0.b-Vf2q8nQ7mbhehpA_SJ27gpvu7KgWCV9tNxUKsWRa4"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);

-- יצירת פונקציה לבדיקה ידנית של טוקנים
CREATE OR REPLACE FUNCTION public.check_facebook_tokens_now()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/check-facebook-tokens',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbWtkbW1uYWp6ZXZvdXBnZmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTY1NjEsImV4cCI6MjA2MDI3MjU2MX0.b-Vf2q8nQ7mbhehpA_SJ27gpvu7KgWCV9tNxUKsWRa4"}'::jsonb,
    body := '{"source": "manual"}'::jsonb
  );
END;
$$;