-- Fix search_path for save_facebook_token function
CREATE OR REPLACE FUNCTION public.save_facebook_token(p_user_id uuid, p_page_id text, p_page_name text, p_access_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO facebook_tokens (user_id, page_id, page_name, access_token)
  VALUES (p_user_id, p_page_id, p_page_name, p_access_token)
  ON CONFLICT (access_token) DO UPDATE
    SET
      access_token = EXCLUDED.access_token,
      page_name = EXCLUDED.page_name,
      updated_at = NOW();

  RAISE NOTICE 'Saved token for page % and user %', p_page_id, p_user_id;
END;
$function$;

-- Fix search_path for save_facebook_lead function  
CREATE OR REPLACE FUNCTION public.save_facebook_lead(p_user_id uuid, p_page_id text, p_lead_id text, p_lead_data jsonb, p_created_at timestamp without time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO facebook_leads (user_id, lead_id, page_id, lead_data, created_at)
  VALUES (p_user_id, p_lead_id, p_page_id, p_lead_data, p_created_at)
  ON CONFLICT (lead_id) DO UPDATE
    SET 
      lead_data = EXCLUDED.lead_data,
      created_at = EXCLUDED.created_at,
      page_id = EXCLUDED.page_id;
END;
$function$;