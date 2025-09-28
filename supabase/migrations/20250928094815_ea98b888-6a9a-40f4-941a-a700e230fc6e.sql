-- First, drop existing policies that might cause issues
DROP POLICY IF EXISTS "Company owners can manage their company" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies through roles" ON public.companies;

-- Create simple policies that won't cause recursion
CREATE POLICY "owners_can_manage_companies" 
ON public.companies 
FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id);

CREATE POLICY "users_can_view_assigned_companies" 
ON public.companies 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = owner_id 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = companies.id
  )
);