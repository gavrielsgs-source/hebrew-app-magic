-- Add public inventory fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inventory_slug TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inventory_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inventory_settings JSONB DEFAULT '{}';

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_inventory_slug ON public.profiles(inventory_slug) WHERE inventory_slug IS NOT NULL;

-- RLS Policy for public access to enabled inventory profiles
CREATE POLICY "Public can view enabled inventory profiles"
ON public.profiles FOR SELECT
TO anon
USING (inventory_enabled = true AND inventory_slug IS NOT NULL);

-- RLS Policy for public access to available cars from enabled dealers
CREATE POLICY "Public can view available cars for enabled dealers"
ON public.cars FOR SELECT
TO anon
USING (
  status = 'available' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = cars.user_id 
    AND profiles.inventory_enabled = true
    AND profiles.inventory_slug IS NOT NULL
  )
);

-- Allow public access to car images in storage
CREATE POLICY "Public can view car images for enabled dealers"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'cars' AND
  EXISTS (
    SELECT 1 FROM public.cars c
    JOIN public.profiles p ON p.id = c.user_id
    WHERE p.inventory_enabled = true
    AND p.inventory_slug IS NOT NULL
    AND c.status = 'available'
  )
);