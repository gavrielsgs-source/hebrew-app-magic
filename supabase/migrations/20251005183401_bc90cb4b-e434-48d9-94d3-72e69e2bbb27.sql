-- Add RLS policies for facebook_tokens table

-- Enable RLS on facebook_tokens (if not already enabled)
ALTER TABLE public.facebook_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own tokens
CREATE POLICY "Users can view their own tokens"
ON public.facebook_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own tokens
CREATE POLICY "Users can insert their own tokens"
ON public.facebook_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tokens
CREATE POLICY "Users can update their own tokens"
ON public.facebook_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own tokens
CREATE POLICY "Users can delete their own tokens"
ON public.facebook_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add missing RLS policies for facebook_leads table

-- Enable RLS on facebook_leads (if not already enabled)
ALTER TABLE public.facebook_leads ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own leads
CREATE POLICY "Users can view their own facebook leads"
ON public.facebook_leads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own leads
CREATE POLICY "Users can delete their own facebook leads"
ON public.facebook_leads
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);