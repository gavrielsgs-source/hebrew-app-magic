-- Fix search_path for get_facebook_tokens function
CREATE OR REPLACE FUNCTION public.get_facebook_tokens(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, access_token text, page_id text, page_name text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path for the other save_facebook_lead overload
CREATE OR REPLACE FUNCTION public.save_facebook_lead(p_user_id uuid, p_lead_id text, p_page_id text, p_form_id text, p_field_data jsonb, p_created_time timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO facebook_leads (user_id, lead_id, page_id, form_id, field_data, created_time)
  VALUES (p_user_id, p_lead_id, p_page_id, p_form_id, p_field_data, p_created_time)
  ON CONFLICT (lead_id) DO UPDATE
  SET 
    field_data = EXCLUDED.field_data,
    created_time = EXCLUDED.created_time,
    page_id = EXCLUDED.page_id,
    form_id = EXCLUDED.form_id,
    user_id = EXCLUDED.user_id;
END;
$function$;