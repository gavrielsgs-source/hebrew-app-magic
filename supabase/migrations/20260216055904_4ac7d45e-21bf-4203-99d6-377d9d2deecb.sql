-- Add company_type column to profiles (עוסק מורשה / חברה בע"מ / עוסק פטור)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_type text DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.company_type IS 'Company type: authorized_dealer (עוסק מורשה), ltd (חברה בע"מ), exempt (עוסק פטור)';