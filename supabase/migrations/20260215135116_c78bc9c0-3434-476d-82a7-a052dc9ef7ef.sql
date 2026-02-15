
-- שלב 1: עדכון המנוי של itscarslead@gmail.com לפעיל
UPDATE public.subscriptions
SET 
  subscription_status = 'active',
  subscription_tier = 'premium',
  billing_amount = 199,
  billing_cycle = 'monthly',
  expires_at = now() + interval '1 month',
  next_billing_date = now() + interval '1 month',
  active = true,
  updated_at = now()
WHERE user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60';

-- שלב 2: החזרת המנוי של gavrielName@outlook.co.il למצב הקודם
UPDATE public.subscriptions
SET 
  subscription_status = 'expired',
  active = true,
  billing_amount = null,
  expires_at = null,
  next_billing_date = null,
  billing_cycle = null,
  updated_at = now()
WHERE user_id = '816dd11c-344a-43c6-8bcb-b91defb5c62d';

-- שלב 3: הוספת רשומת תשלום מוצלח ל-payment_history
INSERT INTO public.payment_history (user_id, amount, payment_type, status, currency, metadata, subscription_id)
SELECT 
  '4588e0ff-3cb1-40e6-b301-635da14d8e60',
  199,
  'monthly',
  'success',
  'ILS',
  '{"source": "tranzila", "confirmation_code": "2623311", "note": "manual fix - payment was successful but subscription was not updated"}'::jsonb,
  s.id
FROM public.subscriptions s
WHERE s.user_id = '4588e0ff-3cb1-40e6-b301-635da14d8e60'
LIMIT 1;
