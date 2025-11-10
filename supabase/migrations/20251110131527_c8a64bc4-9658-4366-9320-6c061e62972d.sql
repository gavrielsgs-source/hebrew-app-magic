-- Create invoices table for invoice management
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ILS',
  billing_details JSONB NOT NULL,
  payment_details JSONB,
  status TEXT NOT NULL DEFAULT 'paid',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date DESC);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all invoices"
  ON public.invoices
  FOR SELECT
  USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create RPC function to check if phone exists
CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = phone_number
  );
END;
$$;