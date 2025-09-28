-- Drop all existing policies for companies table to fix infinite recursion
DROP POLICY IF EXISTS "owners_can_manage_companies" ON public.companies;
DROP POLICY IF EXISTS "users_can_view_assigned_companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Company owners can manage their company" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies through roles" ON public.companies;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_company_ids(_user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(DISTINCT ur.company_id)
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
    AND ur.company_id IS NOT NULL;
$$;

-- Simple policies using the security definer function
CREATE POLICY "owners_can_manage_companies" 
ON public.companies 
FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id);

CREATE POLICY "users_can_view_companies_by_roles" 
ON public.companies 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = owner_id 
  OR 
  companies.id = ANY(get_user_company_ids(auth.uid()))
);