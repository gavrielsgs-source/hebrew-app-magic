-- Set trial_ends_at to tomorrow (Nov 11, 2025) for testing purposes
UPDATE subscriptions
SET trial_ends_at = '2025-11-11 23:59:59+00'::timestamp with time zone,
    updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'babyou.orders@gmail.com'
);