-- תיקון תאריכי ניסיון עבור משתמשים קיימים
-- נעדכן את trial_ends_at להיות 14 ימים מתאריך היצירה של המשתמש
UPDATE public.subscriptions 
SET trial_ends_at = created_at + interval '14 days'
WHERE trial_ends_at IS NOT NULL 
  AND subscription_tier = 'premium'
  AND expires_at IS NULL; -- רק מנויי ניסיון, לא משתמשים ששילמו

-- עדכון פונקציית handle_new_user_subscription כדי שתעבוד נכון עבור משתמשים חדשים
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- יצירת תאריך סיום ניסיון של 14 ימים מזמן יצירת המשתמש (לא מעכשיו)
  INSERT INTO public.subscriptions (user_id, subscription_tier, active, trial_ends_at, created_at)
  VALUES (NEW.id, 'premium', true, NEW.created_at + interval '14 days', NEW.created_at);
  RETURN NEW;
END;
$function$;