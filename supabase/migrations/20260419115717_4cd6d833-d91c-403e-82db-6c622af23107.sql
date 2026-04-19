-- 1. Add override fields to lead_attributions (admin-managed, internal-only)
ALTER TABLE public.lead_attributions
  ADD COLUMN IF NOT EXISTS override_value text,
  ADD COLUMN IF NOT EXISTS override_reason text,
  ADD COLUMN IF NOT EXISTS overridden_by uuid,
  ADD COLUMN IF NOT EXISTS overridden_at timestamptz;

-- Constrain override values to the known LeadSource set (NULL = no override)
ALTER TABLE public.lead_attributions
  DROP CONSTRAINT IF EXISTS lead_attributions_override_value_check;
ALTER TABLE public.lead_attributions
  ADD CONSTRAINT lead_attributions_override_value_check
  CHECK (override_value IS NULL OR override_value IN ('Facebook','Instagram','Meta','Unknown'));

-- Only admins may set/modify override fields. Owners keep their existing UPDATE policy
-- but it only covers non-override columns logically (UI never sends them). To enforce
-- at DB level, add an admin-only UPDATE policy and rely on application layer for the
-- owner path (owner UPDATE does not touch override_* columns).
DROP POLICY IF EXISTS "Admins can update attribution overrides" ON public.lead_attributions;
CREATE POLICY "Admins can update attribution overrides"
ON public.lead_attributions
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all attributions" ON public.lead_attributions;
CREATE POLICY "Admins can view all attributions"
ON public.lead_attributions
FOR SELECT
USING (public.is_admin());

-- 2. Attribution event timeline (internal-only)
CREATE TABLE IF NOT EXISTS public.attribution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lead_ref_id text NOT NULL,
  lead_source_table text NOT NULL DEFAULT 'facebook_leads',
  event_type text NOT NULL,
  -- one of: webhook_received | lead_retrieved | safe_default_applied
  --        | enhanced_lookup_attempted | enhanced_lookup_skipped
  --        | final_attribution_assigned | manual_override_applied
  actor_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attribution_events_lead
  ON public.attribution_events (lead_ref_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attribution_events_user
  ON public.attribution_events (user_id, created_at DESC);

ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;

-- Owners can read their own events; admins can read all
CREATE POLICY "Users can view own attribution events"
ON public.attribution_events
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- Inserts allowed by owner (frontend logging) and by admins; service role bypasses RLS
CREATE POLICY "Users can insert own attribution events"
ON public.attribution_events
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- No update/delete from clients; immutable audit trail (admins can purge via service role if ever needed)
