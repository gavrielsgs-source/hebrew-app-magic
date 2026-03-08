ALTER TABLE public.cars ALTER COLUMN show_in_catalog SET DEFAULT true;

-- Also update existing cars that are available but not yet marked for catalog
UPDATE public.cars SET show_in_catalog = true WHERE status = 'available' AND (show_in_catalog IS NULL OR show_in_catalog = false);