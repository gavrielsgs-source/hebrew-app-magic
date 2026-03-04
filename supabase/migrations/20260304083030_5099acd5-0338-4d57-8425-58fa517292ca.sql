
CREATE OR REPLACE FUNCTION public.admin_extend_subscription(p_subscription_id uuid, p_days integer, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied - Admin only';
  END IF;

  UPDATE public.subscriptions
  SET 
    expires_at = COALESCE(expires_at, NOW()) + (p_days || ' days')::INTERVAL,
    subscription_status = 'active',
    updated_at = NOW()
  WHERE id = p_subscription_id
  RETURNING user_id INTO v_user_id;

  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, old_data, new_data
  ) VALUES (
    v_user_id,
    'ADMIN_EXTEND_SUBSCRIPTION',
    'subscriptions',
    p_subscription_id,
    NULL,
    jsonb_build_object(
      'days_added', p_days,
      'reason', p_reason,
      'admin_email', (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

  RETURN TRUE;
END;
$function$;
