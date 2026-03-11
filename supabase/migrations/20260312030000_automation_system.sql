-- ============================================================
-- Automation System
-- Tables: automation_settings, automation_queue
-- Trigger: cancel follow-ups when lead status changes
-- ============================================================

-- 1. Settings per user
CREATE TABLE IF NOT EXISTS automation_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 text NOT NULL UNIQUE,
  -- Welcome
  welcome_enabled         boolean NOT NULL DEFAULT false,
  welcome_delay_minutes   int NOT NULL DEFAULT 5,
  welcome_template        text NOT NULL DEFAULT 'welcome_message',
  -- Follow-up 1
  followup1_enabled       boolean NOT NULL DEFAULT false,
  followup1_delay_hours   int NOT NULL DEFAULT 24,
  followup1_template      text NOT NULL DEFAULT 'lead_followup',
  -- Follow-up 2
  followup2_enabled       boolean NOT NULL DEFAULT false,
  followup2_delay_hours   int NOT NULL DEFAULT 72,
  followup2_template      text NOT NULL DEFAULT 'lead_followup',
  -- Car match alert
  car_match_enabled       boolean NOT NULL DEFAULT false,
  car_match_template      text NOT NULL DEFAULT 'car_match_alert',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- 2. Queue of pending automated messages
CREATE TABLE IF NOT EXISTS automation_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL,
  lead_id         uuid REFERENCES leads(id) ON DELETE CASCADE,
  automation_type text NOT NULL,   -- 'welcome' | 'followup_1' | 'followup_2' | 'car_match'
  phone           text NOT NULL,
  template_name   text NOT NULL,
  template_params jsonb NOT NULL DEFAULT '[]',
  scheduled_for   timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'pending',  -- 'pending' | 'sent' | 'failed' | 'cancelled'
  attempts        int NOT NULL DEFAULT 0,
  last_error      text,
  sent_at         timestamptz,
  car_id          uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_queue_pending
  ON automation_queue (scheduled_for)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_automation_queue_lead
  ON automation_queue (lead_id);

-- 3. Enable RLS
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_queue    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_settings_owner" ON automation_settings
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "automation_queue_owner" ON automation_queue
  FOR ALL USING (auth.uid()::text = user_id);

-- 4. Cancel pending follow-ups when lead is handled
CREATE OR REPLACE FUNCTION cancel_followups_on_lead_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status IN ('in_treatment', 'meeting_scheduled', 'handled', 'not_relevant') AND
     OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE automation_queue
    SET status = 'cancelled'
    WHERE lead_id = NEW.id
      AND status = 'pending'
      AND automation_type IN ('followup_1', 'followup_2');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cancel_followups ON leads;
CREATE TRIGGER trg_cancel_followups
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION cancel_followups_on_lead_update();
