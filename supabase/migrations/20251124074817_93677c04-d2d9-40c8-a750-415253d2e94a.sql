-- עדכון מנויים שפג תוקפם
UPDATE subscriptions 
SET subscription_status = 'expired',
    active = false,
    updated_at = NOW()
WHERE subscription_status = 'trial'
AND trial_ends_at < NOW();