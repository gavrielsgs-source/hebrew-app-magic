-- ============================================================
-- Automation Cron Job Setup
-- Run this ONCE in Supabase SQL Editor after replacing:
--   YOUR_SERVICE_ROLE_KEY  →  Settings → API → service_role
-- ============================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Schedule the automation queue processor (every 5 minutes)
SELECT cron.schedule(
  'process-automation-queue',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url    := 'https://zjmkdmmnajzevoupgfhg.supabase.co/functions/v1/process-automation-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type',  'application/json'
    ),
    body   := '{}'::jsonb
  );
  $$
);
