
-- Create function to save Facebook token
CREATE OR REPLACE FUNCTION public.save_facebook_token(
  p_user_id UUID,
  p_access_token TEXT,
  p_page_id TEXT,
  p_page_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.facebook_tokens (user_id, access_token, page_id, page_name)
  VALUES (p_user_id, p_access_token, p_page_id, p_page_name)
  ON CONFLICT (user_id, page_id) 
  DO UPDATE SET 
    access_token = EXCLUDED.access_token,
    page_name = EXCLUDED.page_name,
    updated_at = now();
END;
$$;

-- Create function to get Facebook tokens
CREATE OR REPLACE FUNCTION public.get_facebook_tokens(
  p_user_id UUID
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  access_token TEXT,
  page_id TEXT,
  page_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
