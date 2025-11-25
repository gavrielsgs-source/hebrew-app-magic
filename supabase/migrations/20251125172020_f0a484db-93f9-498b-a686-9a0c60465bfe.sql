-- עדכון הטריגר handle_new_user כך שיעתיק גם full_name ו-phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

-- עדכון פרופילים קיימים עם הטלפון והשם מ-auth.users metadata
UPDATE profiles p
SET 
  phone = COALESCE(p.phone, (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = p.id)),
  full_name = COALESCE(p.full_name, (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p.id))
WHERE p.phone IS NULL OR p.full_name IS NULL;