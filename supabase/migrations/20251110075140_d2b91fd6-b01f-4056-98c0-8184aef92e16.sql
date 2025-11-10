-- ===============================================
-- שלב 1: עדכון טבלת subscriptions
-- ===============================================

-- הוספת שדות חדשים לטבלת subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_token TEXT,
ADD COLUMN IF NOT EXISTS recurring_payment_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'past_due')),
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends ON public.subscriptions(trial_ends_at) WHERE subscription_status = 'trial';
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date) WHERE subscription_status = 'active';

-- ===============================================
-- שלב 2: יצירת טבלת payment_history
-- ===============================================

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  transaction_id TEXT,
  asmachta TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('trial_verification', 'trial_refund', 'monthly', 'yearly', 'upgrade', 'downgrade', 'cancellation_refund')),
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
  ON public.payment_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment history"
  ON public.payment_history
  FOR INSERT
  WITH CHECK (true);

-- אינדקסים
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON public.payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON public.payment_history(created_at DESC);

-- ===============================================
-- שלב 3: יצירת טבלת cancellation_feedback
-- ===============================================

CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  reason TEXT,
  feedback TEXT,
  would_return BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own feedback"
  ON public.cancellation_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.cancellation_feedback
  FOR SELECT
  USING (is_admin());

-- ===============================================
-- שלב 4: פונקציה לבדיקת תפוגת ניסיון
-- ===============================================

CREATE OR REPLACE FUNCTION public.get_expiring_trials(days_ahead INTEGER DEFAULT 0)
RETURNS TABLE (
  subscription_id UUID,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  days_left INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as subscription_id,
    s.user_id,
    au.email,
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
$$;

-- ===============================================
-- שלב 5: פונקציה לבדיקת תשלומים שנכשלו
-- ===============================================

CREATE OR REPLACE FUNCTION public.get_failed_payments(hours_ago INTEGER DEFAULT 24)
RETURNS TABLE (
  payment_id UUID,
  user_id UUID,
  email TEXT,
  amount NUMERIC,
  failure_reason TEXT,
  attempt_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.id as payment_id,
    ph.user_id,
    au.email,
    ph.amount,
    ph.failure_reason,
    (ph.metadata->>'retry_count')::INTEGER as attempt_count
  FROM public.payment_history ph
  JOIN auth.users au ON au.id = ph.user_id
  WHERE ph.status = 'failed'
    AND ph.created_at >= (now() - (hours_ago || ' hours')::INTERVAL)
    AND COALESCE((ph.metadata->>'retry_count')::INTEGER, 0) < 3
  ORDER BY ph.created_at DESC;
END;
$$;

-- ===============================================
-- שלב 6: טריגר לעדכון אוטומטי של subscription_status
-- ===============================================

CREATE OR REPLACE FUNCTION public.auto_expire_subscriptions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- אם פג תוקף המנוי ולא בוטל, סמן כ-expired
  IF NEW.expires_at < now() AND NEW.subscription_status != 'cancelled' THEN
    NEW.subscription_status := 'expired';
  END IF;
  
  -- אם פג תוקף הניסיון ועדיין במצב trial, סמן כ-expired
  IF NEW.trial_ends_at < now() AND NEW.subscription_status = 'trial' THEN
    NEW.subscription_status := 'expired';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_expire_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_expire_subscriptions();

-- ===============================================
-- שלב 7: מעבר נתונים קיימים
-- ===============================================

-- עדכון משתמשים קיימים עם מנוי פעיל
UPDATE public.subscriptions
SET 
  subscription_status = CASE 
    WHEN active = true AND (expires_at IS NULL OR expires_at > now()) THEN 'active'
    WHEN active = false OR expires_at < now() THEN 'expired'
    ELSE 'trial'
  END,
  next_billing_date = CASE 
    WHEN active = true AND expires_at > now() THEN expires_at
    ELSE NULL
  END,
  billing_cycle = 'monthly'
WHERE subscription_status IS NULL;

-- הגדרת billing_amount על פי tier
UPDATE public.subscriptions
SET billing_amount = CASE subscription_tier
  WHEN 'premium' THEN 99.00
  WHEN 'business' THEN 299.00
  WHEN 'enterprise' THEN 999.00
  ELSE 0
END
WHERE billing_amount IS NULL;