-- Fix subscription for gavrielName@outlook.co.il (user_id: 816dd11c-344a-43c6-8bcb-b91defb5c62d)
-- Payment was successfully charged (199 ILS, ConfirmationCode: 2623311) but webhook failed to update subscription
UPDATE subscriptions 
SET subscription_tier = 'premium',
    subscription_status = 'active',
    active = true,
    billing_cycle = 'monthly',
    billing_amount = 199,
    expires_at = NOW() + INTERVAL '1 month',
    next_billing_date = NOW() + INTERVAL '1 month',
    cancel_at_period_end = false,
    cancelled_at = NULL,
    updated_at = NOW()
WHERE user_id = '816dd11c-344a-43c6-8bcb-b91defb5c62d';