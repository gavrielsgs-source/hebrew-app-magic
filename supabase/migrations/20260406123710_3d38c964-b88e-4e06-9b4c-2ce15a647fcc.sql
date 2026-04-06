UPDATE public.subscriptions
SET 
  expires_at = now() + interval '30 days',
  subscription_status = 'active',
  updated_at = now()
WHERE id = '3401b850-d815-44a2-a3a4-85ed226143c9';