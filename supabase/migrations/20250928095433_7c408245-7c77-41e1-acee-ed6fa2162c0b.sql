-- Completely remove all existing policies to eliminate infinite recursion
DROP POLICY IF EXISTS "owners_can_manage_companies" ON public.companies;
DROP POLICY IF EXISTS "users_can_view_companies_by_roles" ON public.companies;

-- Drop the security definer function
DROP FUNCTION IF EXISTS public.get_user_company_ids(_user_id uuid);

-- Create the simplest possible policies that won't cause recursion
CREATE POLICY "company_owners_full_access" 
ON public.companies 
FOR ALL 
TO authenticated 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- For SELECT operations only, allow viewing companies through roles
-- This query doesn't reference the companies table within the policy, so no recursion
CREATE POLICY "company_members_select_access" 
ON public.companies 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.company_id = companies.id
  )
);