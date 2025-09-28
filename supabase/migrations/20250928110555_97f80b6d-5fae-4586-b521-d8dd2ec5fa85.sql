-- Drop all triggers first
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
DROP TRIGGER IF EXISTS handle_new_company_subscription_trigger ON public.companies;

-- Now drop the function
DROP FUNCTION IF EXISTS public.handle_new_company_subscription() CASCADE;

-- Create updated function that handles existing subscriptions
CREATE OR REPLACE FUNCTION public.handle_new_company_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user already has a subscription
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = NEW.owner_id
  ) THEN
    -- Create trial subscription for new company if user doesn't have one
    INSERT INTO public.subscriptions (
      company_id, 
      user_id, 
      subscription_tier, 
      active, 
      trial_ends_at,
      max_users,
      active_users_count,
      created_at
    )
    VALUES (
      NEW.id, 
      NEW.owner_id, 
      'premium', 
      true, 
      NEW.created_at + interval '14 days',
      2,
      1,
      NEW.created_at
    );
  ELSE
    -- If user already has a subscription, just update it to link to the new company
    UPDATE public.subscriptions 
    SET company_id = NEW.id,
        updated_at = now()
    WHERE user_id = NEW.owner_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company_subscription();