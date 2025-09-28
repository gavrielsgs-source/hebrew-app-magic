-- Fix search_path for functions to resolve security warnings
CREATE OR REPLACE FUNCTION public.get_user_companies()
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_ids UUID[];
BEGIN
  -- If user is admin, return all companies
  IF public.has_role('admin') THEN
    SELECT array_agg(id) INTO company_ids FROM public.companies;
    RETURN company_ids;
  END IF;

  -- If user is company owner, return their companies
  SELECT array_agg(id) INTO company_ids
  FROM public.companies
  WHERE owner_id = auth.uid();

  -- Also include companies where user has roles
  SELECT array_agg(DISTINCT c.id) INTO company_ids
  FROM public.companies c
  JOIN public.agencies a ON a.company_id = c.id
  JOIN public.user_roles ur ON ur.agency_id = a.id
  WHERE ur.user_id = auth.uid()
  UNION
  SELECT unnest(company_ids);

  RETURN company_ids;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner(company_id_param UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.companies 
    WHERE id = company_id_param AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;