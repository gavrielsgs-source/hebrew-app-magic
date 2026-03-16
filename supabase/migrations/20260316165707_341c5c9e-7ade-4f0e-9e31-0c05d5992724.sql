-- Ensure profiles table has RLS enabled and owner-manage policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure automation_settings exists with current compatible schema and proper RLS
CREATE TABLE IF NOT EXISTS public.automation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  welcome_template TEXT NOT NULL DEFAULT 'welcome_message',
  followup2_template TEXT NOT NULL DEFAULT 'lead_followup',
  car_match_template TEXT NOT NULL DEFAULT 'car_match_alert',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  welcome_enabled BOOLEAN NOT NULL DEFAULT false,
  welcome_delay_minutes INTEGER NOT NULL DEFAULT 5,
  followup1_enabled BOOLEAN NOT NULL DEFAULT false,
  followup1_delay_hours INTEGER NOT NULL DEFAULT 24,
  followup2_enabled BOOLEAN NOT NULL DEFAULT false,
  followup2_delay_hours INTEGER NOT NULL DEFAULT 72,
  car_match_enabled BOOLEAN NOT NULL DEFAULT false,
  followup1_template TEXT NOT NULL DEFAULT 'lead_followup',
  user_id TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS automation_settings_user_id_key
ON public.automation_settings (user_id);

ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "automation_settings_owner" ON public.automation_settings;
CREATE POLICY "automation_settings_owner"
ON public.automation_settings
FOR ALL
TO authenticated
USING ((auth.uid())::text = user_id)
WITH CHECK ((auth.uid())::text = user_id);

DROP TRIGGER IF EXISTS update_automation_settings_updated_at ON public.automation_settings;
CREATE TRIGGER update_automation_settings_updated_at
BEFORE UPDATE ON public.automation_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();