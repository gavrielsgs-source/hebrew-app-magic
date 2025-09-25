-- Fix database functions with explicit search_path for security
CREATE OR REPLACE FUNCTION public.get_facebook_tokens(p_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, access_token text, page_id text, page_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ft.id,
    ft.user_id,
    ft.access_token,
    ft.page_id,
    ft.page_name,
    ft.created_at
  FROM public.facebook_tokens ft
  WHERE ft.user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(role_name user_role, agency_id_param uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  matching_roles INTEGER;
BEGIN
  IF agency_id_param IS NULL THEN
    SELECT COUNT(*) INTO matching_roles
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = role_name;
  ELSE
    SELECT COUNT(*) INTO matching_roles
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = role_name AND (agency_id = agency_id_param OR agency_id IS NULL);
  END IF;

  RETURN matching_roles > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_agencies()
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  agency_ids UUID[];
BEGIN
  -- אם משתמש הוא אדמין, מחזירים את כל הסוכנויות
  IF public.has_role('admin') THEN
    SELECT array_agg(id) INTO agency_ids FROM public.agencies;
    RETURN agency_ids;
  END IF;

  -- אחרת, מחזירים רק סוכנויות שמשתמש שייך אליהן
  SELECT array_agg(agency_id) INTO agency_ids
  FROM public.user_roles
  WHERE user_id = auth.uid() AND agency_id IS NOT NULL;

  RETURN agency_ids;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_agency_manager_or_admin(agency_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*) > 0
    FROM public.user_roles
    WHERE user_id = auth.uid() AND
          ((role = 'agency_manager' AND agency_id = agency_id_param) OR role = 'admin')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- יצירת תאריך סיום ניסיון של 14 ימים מזמן יצירת המשתמש (לא מעכשיו)
  INSERT INTO public.subscriptions (user_id, subscription_tier, active, trial_ends_at, created_at)
  VALUES (NEW.id, 'premium', true, NEW.created_at + interval '14 days', NEW.created_at);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_facebook_token(p_user_id uuid, p_access_token text, p_page_id text, p_page_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.facebook_tokens (user_id, access_token, page_id, page_name)
  VALUES (p_user_id, p_access_token, p_page_id, p_page_name)
  ON CONFLICT (user_id, page_id) 
  DO UPDATE SET 
    access_token = EXCLUDED.access_token,
    page_name = EXCLUDED.page_name,
    updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.gdpr_delete_user(user_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- בדיקת הרשאות - רק אדמין או המשתמש עצמו יכולים למחוק
  IF NOT (auth.uid() = user_id_param OR public.has_role('admin')) THEN
    RAISE EXCEPTION 'הרשאה לא מספקת למחיקת משתמש';
  END IF;

  -- מחיקת כל הנתונים הקשורים למשתמש
  -- מחיקת לידים
  DELETE FROM public.leads WHERE user_id = user_id_param;

  -- מחיקת רכבים
  DELETE FROM public.cars WHERE user_id = user_id_param;

  -- מחיקת משימות
  DELETE FROM public.tasks WHERE user_id = user_id_param;

  -- מחיקת פרופיל
  DELETE FROM public.profiles WHERE id = user_id_param;

  -- מחיקת הרשאות
  DELETE FROM public.user_roles WHERE user_id = user_id_param;

  -- ניתן להוסיף גם רישום נפרד של פעולת המחיקה עבור תיעוד GDPR
  INSERT INTO public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), 'GDPR_DELETE', 'users', user_id_param, NULL, NULL);

  -- שים לב: איננו מוחקים את המשתמש עצמו מטבלת auth.users כיוון שזה מנוהל על ידי סופאבייס
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_audit_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD), NULL);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, NULL, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create enhanced audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    action_type text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    ip_address inet,
    user_agent text,
    success boolean NOT NULL DEFAULT true,
    error_message text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for security audit logs - only admins can view
CREATE POLICY "Only admins can view security audit logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (public.is_admin());

-- Create policy to allow system to insert security audit logs
CREATE POLICY "Allow system to insert security audit logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id uuid,
    p_action_type text,
    p_resource_type text,
    p_resource_id uuid DEFAULT NULL,
    p_success boolean DEFAULT true,
    p_error_message text DEFAULT NULL,
    p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.security_audit_logs (
        user_id, 
        action_type, 
        resource_type, 
        resource_id, 
        success, 
        error_message, 
        metadata
    ) VALUES (
        p_user_id, 
        p_action_type, 
        p_resource_type, 
        p_resource_id, 
        p_success, 
        p_error_message, 
        p_metadata
    );
END;
$function$;