
-- עדכון הפונקציה handle_new_user_subscription כדי ליצור מנוי premium עם ניסיון 14 ימים
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- יצירת תאריך סיום ניסיון של 14 ימים מהיום
  INSERT INTO public.subscriptions (user_id, subscription_tier, active, trial_ends_at)
  VALUES (NEW.id, 'premium', true, now() + interval '14 days');
  RETURN NEW;
END;
$function$;

-- עדכון כל המשתמשים הקיימים שיש להם מנוי "free" לקבל מנוי "premium" עם ניסיון 14 ימים
UPDATE public.subscriptions 
SET 
  subscription_tier = 'premium',
  trial_ends_at = now() + interval '14 days',
  active = true
WHERE subscription_tier = 'free' AND trial_ends_at IS NULL;
