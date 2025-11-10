-- Fix get_expiring_trials function to properly cast email to text
CREATE OR REPLACE FUNCTION public.get_expiring_trials(days_ahead integer DEFAULT 0)
 RETURNS TABLE(
   subscription_id uuid, 
   user_id uuid, 
   email text, 
   full_name text, 
   subscription_tier text, 
   trial_ends_at timestamp with time zone, 
   days_left integer
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as subscription_id,
    s.user_id,
    au.email::text,
    p.full_name,
    s.subscription_tier,
    s.trial_ends_at,
    EXTRACT(DAY FROM (s.trial_ends_at - now()))::INTEGER as days_left
  FROM public.subscriptions s
  JOIN auth.users au ON au.id = s.user_id
  LEFT JOIN public.profiles p ON p.id = s.user_id
  WHERE s.subscription_status = 'trial'
    AND s.trial_ends_at IS NOT NULL
    AND s.cancel_at_period_end = false
    AND s.trial_ends_at <= (now() + (days_ahead || ' days')::INTERVAL)
    AND s.trial_ends_at > now()
  ORDER BY s.trial_ends_at ASC;
END;
$function$;