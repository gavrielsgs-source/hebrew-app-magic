-- Per-user override flag for enhanced attribution feature
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS attribution_enhanced boolean NOT NULL DEFAULT false;

-- Mirror table for attribution evidence (populated when feature flag is ON)
CREATE TABLE IF NOT EXISTS public.lead_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lead_source_table text NOT NULL DEFAULT 'facebook_leads', -- 'facebook_leads' | 'leads'
  lead_ref_id text NOT NULL, -- facebook_leads.lead_id or leads.id
  lead_source_raw text,        -- e.g. 'leadgen_webhook'
  lead_source_display text,    -- 'Facebook' | 'Instagram' | 'Meta' | 'Unknown'
  detection_method text,       -- 'default_safe' | 'ad_metadata_instagram_actor' | 'ad_metadata_no_instagram_markers' | 'ad_lookup_failed' | 'no_ad_id' | 'ad_lookup_exception'
  detection_confidence text,   -- 'none' | 'low' | 'medium' | 'high'
  detection_error text,
  ad_id text,
  campaign_id text,
  form_id text,
  page_id text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lead_source_table, lead_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_attributions_user_id ON public.lead_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_attributions_ref ON public.lead_attributions(lead_source_table, lead_ref_id);

ALTER TABLE public.lead_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attributions"
  ON public.lead_attributions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own attributions"
  ON public.lead_attributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attributions"
  ON public.lead_attributions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attributions"
  ON public.lead_attributions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_lead_attributions_updated_at
  BEFORE UPDATE ON public.lead_attributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();