
-- Add new columns to cars table
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS entry_date DATE,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS chassis_number TEXT,
ADD COLUMN IF NOT EXISTS next_test_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN public.cars.entry_date IS 'תאריך כניסת הרכב למלאי';
COMMENT ON COLUMN public.cars.license_number IS 'מספר רישוי הרכב';
COMMENT ON COLUMN public.cars.chassis_number IS 'מספר שלדה של הרכב';
COMMENT ON COLUMN public.cars.next_test_date IS 'תאריך הטסט הבא של הרכב';
