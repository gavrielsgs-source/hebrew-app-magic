-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Update user_role enum to include new roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'company_owner';

-- Update agencies table to link to companies
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update subscriptions to link to companies instead of users
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Add user limits tracking to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS active_users_count INTEGER DEFAULT 0;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 2;

-- Create RLS policies for companies
CREATE POLICY "Company owners can manage their company" 
ON public.companies 
FOR ALL 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can view companies they belong to" 
ON public.companies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.agencies a ON ur.agency_id = a.id 
    WHERE ur.user_id = auth.uid() AND a.company_id = companies.id
  ) OR auth.uid() = owner_id
);

-- Update agencies policies to work with companies
DROP POLICY IF EXISTS "Admins can manage all agencies" ON public.agencies;
DROP POLICY IF EXISTS "Agency managers can update their agencies" ON public.agencies;
DROP POLICY IF EXISTS "Agency managers can view their agencies" ON public.agencies;

CREATE POLICY "Company owners and admins can manage agencies" 
ON public.agencies 
FOR ALL 
USING (
  has_role('admin'::user_role) OR 
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = agencies.company_id AND c.owner_id = auth.uid()
  ) OR
  owner_id = auth.uid()
);

CREATE POLICY "Users can view agencies in their company" 
ON public.agencies 
FOR SELECT 
USING (
  has_role('admin'::user_role) OR 
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = agencies.company_id AND c.owner_id = auth.uid()
  ) OR
  owner_id = auth.uid() OR
  id = ANY (get_user_agencies())
);

-- Update subscriptions policies
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

CREATE POLICY "Company owners can manage their subscription" 
ON public.subscriptions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = subscriptions.company_id AND c.owner_id = auth.uid()
  ) OR
  auth.uid() = user_id -- For legacy subscriptions
);

CREATE POLICY "Users can view their company subscription" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    JOIN public.agencies a ON a.company_id = c.id
    JOIN public.user_roles ur ON ur.agency_id = a.id
    WHERE c.id = subscriptions.company_id AND ur.user_id = auth.uid()
  ) OR
  auth.uid() = user_id -- For legacy subscriptions
);

-- Create user invitations table
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage invitations" 
ON public.user_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = user_invitations.company_id AND c.owner_id = auth.uid()
  )
);

-- Update user_roles to support company structure
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Create function to get user companies
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

-- Create function to check if user is company owner
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

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user subscription for companies
CREATE OR REPLACE FUNCTION public.handle_new_company_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create trial subscription for new company
  INSERT INTO public.subscriptions (
    company_id, 
    user_id, 
    subscription_tier, 
    active, 
    trial_ends_at,
    max_users,
    active_users_count,
    created_at
  )
  VALUES (
    NEW.id, 
    NEW.owner_id, 
    'premium', 
    true, 
    NEW.created_at + interval '14 days',
    2,
    1,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company_subscription();