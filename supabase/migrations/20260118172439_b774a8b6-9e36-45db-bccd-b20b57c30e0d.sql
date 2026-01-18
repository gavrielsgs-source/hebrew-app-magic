-- Create customer_payments table for tracking all payments
CREATE TABLE public.customer_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.customer_vehicle_purchases(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  notes TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add amount_paid column to customer_vehicle_purchases
ALTER TABLE public.customer_vehicle_purchases 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_payments
CREATE POLICY "Users can view payments for their customers"
ON public.customer_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_payments.customer_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create payments for their customers"
ON public.customer_payments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_payments.customer_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update payments for their customers"
ON public.customer_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_payments.customer_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete payments for their customers"
ON public.customer_payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = customer_payments.customer_id
    AND c.user_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX idx_customer_payments_customer_id ON public.customer_payments(customer_id);
CREATE INDEX idx_customer_payments_purchase_id ON public.customer_payments(purchase_id);