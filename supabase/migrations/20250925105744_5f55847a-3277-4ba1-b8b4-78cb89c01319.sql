-- Create document_sequences table for sequential numbering per user
CREATE TABLE public.document_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type)
);

-- Create tax_invoices table for storing tax invoice data
CREATE TABLE public.tax_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID,
  car_id UUID,
  invoice_number TEXT NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ILS',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  company_name TEXT,
  company_address TEXT,
  company_hp TEXT,
  company_phone TEXT,
  company_authorized_dealer BOOLEAN DEFAULT false,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_hp TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for document_sequences
CREATE POLICY "Users can view their own document sequences" 
ON public.document_sequences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document sequences" 
ON public.document_sequences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document sequences" 
ON public.document_sequences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for tax_invoices
CREATE POLICY "Users can view their own tax invoices" 
ON public.tax_invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax invoices" 
ON public.tax_invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax invoices" 
ON public.tax_invoices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax invoices" 
ON public.tax_invoices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_document_sequences_updated_at
BEFORE UPDATE ON public.document_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_invoices_updated_at
BEFORE UPDATE ON public.tax_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit logging triggers
CREATE TRIGGER audit_document_sequences_changes
AFTER INSERT OR UPDATE OR DELETE ON public.document_sequences
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_tax_invoices_changes
AFTER INSERT OR UPDATE OR DELETE ON public.tax_invoices
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();