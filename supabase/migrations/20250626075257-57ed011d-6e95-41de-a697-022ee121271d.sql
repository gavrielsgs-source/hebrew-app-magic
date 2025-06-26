
-- Add is_template column to documents table
ALTER TABLE public.documents 
ADD COLUMN is_template boolean DEFAULT false;

-- Update existing documents to have is_template = false by default
UPDATE public.documents 
SET is_template = false 
WHERE is_template IS NULL;
