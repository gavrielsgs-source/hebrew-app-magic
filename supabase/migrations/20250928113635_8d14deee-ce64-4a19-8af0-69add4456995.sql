-- Create default agencies for existing companies that don't have any
INSERT INTO public.agencies (name, owner_id, company_id)
SELECT 
  c.name || ' - סוכנות ראשית' as name,
  c.owner_id,
  c.id as company_id
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.agencies a WHERE a.company_id = c.id
);

-- Create or update trigger to automatically create default agency when company is created
CREATE OR REPLACE FUNCTION public.handle_new_company_with_agency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the existing subscription function first
  PERFORM public.handle_new_company_subscription();
  
  -- Create default agency for the new company
  INSERT INTO public.agencies (name, owner_id, company_id)
  VALUES (NEW.name || ' - סוכנות ראשית', NEW.owner_id, NEW.id);
  
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_handle_new_company_subscription ON public.companies;
CREATE TRIGGER trigger_handle_new_company_with_agency
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company_with_agency();