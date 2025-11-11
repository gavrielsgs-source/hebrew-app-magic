-- Add trim_level column to cars table
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS trim_level TEXT;