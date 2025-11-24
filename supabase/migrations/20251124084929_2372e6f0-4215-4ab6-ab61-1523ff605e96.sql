
-- הסרת הפונקציה הקיימת
DROP FUNCTION IF EXISTS public.get_all_subscriptions();

-- יצירת הפונקציה מחדש עם העמודה החדשה
CREATE OR REPLACE FUNCTION public.get_all_subscriptions()
RETURNS TABLE(
  subscription_id uuid, 
  user_id uuid, 
  user_email text, 
  full_name text,
  phone text,
  subscription_tier text, 
  subscription_status text, 
  trial_ends_at timestamp with time zone, 
  expires_at timestamp with time zone, 
  billing_amount numeric, 
  billing_cycle text, 
  next_billing_date timestamp with time zone, 
  cancel_at_period_end boolean, 
  cancelled_at timestamp with time zone, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  company_id uuid, 
  max_users integer, 
  active_users_count integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    s.id,
    s.user_id,
    au.email,
    p.full_name,
    p.phone,
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
