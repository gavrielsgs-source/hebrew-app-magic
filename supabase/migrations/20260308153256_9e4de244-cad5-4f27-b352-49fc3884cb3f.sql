
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_make text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_model text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_year_from integer;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_year_to integer;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_max_price numeric;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_max_km integer;
