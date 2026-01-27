-- Add company details fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_hp TEXT,
ADD COLUMN IF NOT EXISTS company_authorized_dealer BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.company_address IS 'Company address for document generation';
COMMENT ON COLUMN public.profiles.company_hp IS 'Company business ID (ח.פ) for document generation';
COMMENT ON COLUMN public.profiles.company_authorized_dealer IS 'Whether company is an authorized dealer';