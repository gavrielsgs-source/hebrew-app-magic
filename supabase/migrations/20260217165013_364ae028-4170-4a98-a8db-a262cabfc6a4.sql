
-- Add new columns to cars table for the car card wizard
ALTER TABLE public.cars
  ADD COLUMN IF NOT EXISTS car_type text DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS owner_customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origin_type text,
  ADD COLUMN IF NOT EXISTS model_code text,
  ADD COLUMN IF NOT EXISTS engine_number text,
  ADD COLUMN IF NOT EXISTS vat_paid numeric,
  ADD COLUMN IF NOT EXISTS asking_price numeric,
  ADD COLUMN IF NOT EXISTS minimum_price numeric,
  ADD COLUMN IF NOT EXISTS list_price numeric,
  ADD COLUMN IF NOT EXISTS registration_fee numeric,
  ADD COLUMN IF NOT EXISTS is_pledged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_catalog boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dealer_price numeric,
  ADD COLUMN IF NOT EXISTS catalog_price numeric;

-- Add index for catalog filtering
CREATE INDEX IF NOT EXISTS idx_cars_show_in_catalog ON public.cars (show_in_catalog) WHERE show_in_catalog = true;

-- Add index for owner customer lookup
CREATE INDEX IF NOT EXISTS idx_cars_owner_customer_id ON public.cars (owner_customer_id) WHERE owner_customer_id IS NOT NULL;
