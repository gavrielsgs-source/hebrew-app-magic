-- פונקציה לקבלת כל המנויים (אדמין בלבד)
CREATE OR REPLACE FUNCTION public.get_all_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  user_id UUID,
  user_email TEXT,
  full_name TEXT,
  subscription_tier TEXT,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  billing_amount NUMERIC,
  billing_cycle TEXT,
  next_billing_date TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  company_id UUID,
  max_users INTEGER,
  active_users_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.user_id,
    au.email,
    p.full_name,
    s.subscription_tier,
    s.subscription_status,
    s.trial_ends_at,
    s.expires_at,
    s.billing_amount,
    s.billing_cycle,
    s.next_billing_date,
    s.cancel_at_period_end,
    s.cancelled_at,
    s.created_at,
    s.updated_at,
    s.company_id,
    s.max_users,
    s.active_users_count
  FROM public.subscriptions s
  LEFT JOIN auth.users au ON au.id = s.user_id
  LEFT JOIN public.profiles p ON p.id = s.user_id
  WHERE public.is_admin();
$$;

-- פונקציה להארכת מנוי (אדמין בלבד)
CREATE OR REPLACE FUNCTION public.admin_extend_subscription(
  p_subscription_id UUID,
  p_days INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- בדיקה שהמשתמש הוא אדמין
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied - Admin only';
  END IF;

  -- עדכון תאריך הפקיעה
  UPDATE public.subscriptions
  SET 
    expires_at = COALESCE(expires_at, NOW()) + (p_days || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE id = p_subscription_id
  RETURNING user_id INTO v_user_id;

  -- רישום באודיט
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
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
$$;

-- פונקציה לשינוי סטטוס מנוי (אדמין בלבד)
CREATE OR REPLACE FUNCTION public.admin_change_subscription_status(
  p_subscription_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied - Admin only';
  END IF;

  -- שמירת הסטטוס הישן
  SELECT subscription_status INTO v_old_status
  FROM public.subscriptions
  WHERE id = p_subscription_id;

  -- עדכון הסטטוס
  UPDATE public.subscriptions
  SET 
    subscription_status = p_new_status,
    updated_at = NOW()
  WHERE id = p_subscription_id;

  -- רישום באודיט
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    (SELECT user_id FROM subscriptions WHERE id = p_subscription_id),
    'ADMIN_CHANGE_STATUS',
    'subscriptions',
    p_subscription_id,
    jsonb_build_object('old_status', v_old_status),
    jsonb_build_object(
      'new_status', p_new_status,
      'reason', p_reason,
      'admin_email', (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

  RETURN TRUE;
END;
$$;

-- פונקציה לשינוי חבילה (אדמין בלבד)
CREATE OR REPLACE FUNCTION public.admin_change_subscription_tier(
  p_subscription_id UUID,
  p_new_tier TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_tier TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied - Admin only';
  END IF;

  -- שמירת החבילה הישנה
  SELECT subscription_tier INTO v_old_tier
  FROM public.subscriptions
  WHERE id = p_subscription_id;

  -- עדכון החבילה
  UPDATE public.subscriptions
  SET 
    subscription_tier = p_new_tier,
    updated_at = NOW()
  WHERE id = p_subscription_id;

  -- רישום באודיט
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    (SELECT user_id FROM subscriptions WHERE id = p_subscription_id),
    'ADMIN_CHANGE_TIER',
    'subscriptions',
    p_subscription_id,
    jsonb_build_object('old_tier', v_old_tier),
    jsonb_build_object(
      'new_tier', p_new_tier,
      'reason', p_reason,
      'admin_email', (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

  RETURN TRUE;
END;
$$;

-- פונקציה לקבלת סטטיסטיקות מנויים (אדמין בלבד)
CREATE OR REPLACE FUNCTION public.get_subscription_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_subscriptions', (SELECT COUNT(*) FROM subscriptions),
    'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE subscription_status = 'active'),
    'trial_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE subscription_status = 'trial'),
    'expired_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE subscription_status IN ('expired', 'past_due')),
    'cancelled_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE subscription_status = 'cancelled'),
    'mrr', (SELECT COALESCE(SUM(billing_amount), 0) FROM subscriptions WHERE subscription_status = 'active' AND billing_cycle = 'monthly'),
    'arr', (SELECT COALESCE(SUM(billing_amount), 0) FROM subscriptions WHERE subscription_status = 'active' AND billing_cycle = 'yearly')
  )
  WHERE public.is_admin();
$$;

-- פונקציה לקבלת נתונים לגרף מנויים לאורך זמן
CREATE OR REPLACE FUNCTION public.get_subscription_timeline()
RETURNS TABLE (
  month TEXT,
  active INTEGER,
  trial INTEGER,
  expired INTEGER,
  cancelled INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month,
    COUNT(*) FILTER (WHERE subscription_status = 'active') as active,
    COUNT(*) FILTER (WHERE subscription_status = 'trial') as trial,
    COUNT(*) FILTER (WHERE subscription_status IN ('expired', 'past_due')) as expired,
    COUNT(*) FILTER (WHERE subscription_status = 'cancelled') as cancelled
  FROM subscriptions
  WHERE created_at >= NOW() - INTERVAL '12 months'
  AND public.is_admin()
  GROUP BY date_trunc('month', created_at)
  ORDER BY month DESC;
$$;