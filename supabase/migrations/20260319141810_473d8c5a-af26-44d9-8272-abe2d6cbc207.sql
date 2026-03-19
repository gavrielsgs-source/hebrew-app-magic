-- Step 1: Drop the broken trigger
DROP TRIGGER IF EXISTS trigger_handle_new_company_with_agency ON public.companies;

-- Step 2: Update handle_new_company_subscription to also create default agency
CREATE OR REPLACE FUNCTION public.handle_new_company_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user already has a subscription
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = NEW.owner_id
  ) THEN
    INSERT INTO public.subscriptions (
      company_id, user_id, subscription_tier, active, trial_ends_at, max_users, active_users_count, created_at
    ) VALUES (
      NEW.id, NEW.owner_id, 'premium', true, NEW.created_at + interval '14 days', 2, 1, NEW.created_at
    );
  ELSE
    UPDATE public.subscriptions 
    SET company_id = NEW.id, updated_at = now()
    WHERE user_id = NEW.owner_id;
  END IF;

  -- Create default agency for the new company
  INSERT INTO public.agencies (name, owner_id, company_id)
  VALUES (NEW.name || ' - סוכנות ראשית', NEW.owner_id, NEW.id);

  RETURN NEW;
END;
$function$;