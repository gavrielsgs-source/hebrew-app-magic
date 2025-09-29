-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_number SERIAL NOT NULL,
  full_name TEXT NOT NULL,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'ישראל',
  fax TEXT,
  source TEXT DEFAULT 'ידני',
  join_date DATE DEFAULT CURRENT_DATE,
  customer_type TEXT DEFAULT 'private' CHECK (customer_type IN ('private', 'business')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  credit_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, customer_number)
);

-- Create customer_notes table
CREATE TABLE public.customer_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_vehicle_purchases table (רכבים שנמכרו ללקוח)
CREATE TABLE public.customer_vehicle_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  purchase_price NUMERIC(10,2),
  purchase_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_vehicle_sales table (רכבים שנרכשו מהלקוח)
CREATE TABLE public.customer_vehicle_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  sale_price NUMERIC(10,2),
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_documents table
CREATE TABLE public.customer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_number TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(10,2),
  date DATE DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_document_returns table
CREATE TABLE public.customer_document_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_document_id UUID NOT NULL REFERENCES public.customer_documents(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vehicle_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vehicle_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_document_returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view their own customers"
ON public.customers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers"
ON public.customers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
ON public.customers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
ON public.customers FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for customer_notes
CREATE POLICY "Users can view notes for their customers"
ON public.customer_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_notes.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can create notes for their customers"
ON public.customer_notes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own notes"
ON public.customer_notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.customer_notes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for customer_vehicle_purchases
CREATE POLICY "Users can view purchases for their customers"
ON public.customer_vehicle_purchases FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_vehicle_purchases.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can create purchases for their customers"
ON public.customer_vehicle_purchases FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can update purchases for their customers"
ON public.customer_vehicle_purchases FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_vehicle_purchases.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can delete purchases for their customers"
ON public.customer_vehicle_purchases FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_vehicle_purchases.customer_id AND c.user_id = auth.uid()
));

-- RLS Policies for customer_vehicle_sales
CREATE POLICY "Users can view sales for their customers"
ON public.customer_vehicle_sales FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_vehicle_sales.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can create sales for their customers"
ON public.customer_vehicle_sales FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can update sales for their customers"
ON public.customer_vehicle_sales FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_vehicle_sales.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can delete sales for their customers"
ON public.customer_vehicle_sales FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_vehicle_sales.customer_id AND c.user_id = auth.uid()
));

-- RLS Policies for customer_documents
CREATE POLICY "Users can view documents for their customers"
ON public.customer_documents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_documents.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can create documents for their customers"
ON public.customer_documents FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents for their customers"
ON public.customer_documents FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_documents.customer_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can delete documents for their customers"
ON public.customer_documents FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.customers c 
  WHERE c.id = customer_documents.customer_id AND c.user_id = auth.uid()
));

-- RLS Policies for customer_document_returns
CREATE POLICY "Users can view document returns for their customers"
ON public.customer_document_returns FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.customer_documents cd
  JOIN public.customers c ON c.id = cd.customer_id 
  WHERE cd.id = customer_document_returns.customer_document_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can create document returns for their customers"
ON public.customer_document_returns FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.customer_documents cd
  JOIN public.customers c ON c.id = cd.customer_id 
  WHERE cd.id = customer_document_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can update document returns for their customers"
ON public.customer_document_returns FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.customer_documents cd
  JOIN public.customers c ON c.id = cd.customer_id 
  WHERE cd.id = customer_document_returns.customer_document_id AND c.user_id = auth.uid()
));

CREATE POLICY "Users can delete document returns for their customers"
ON public.customer_document_returns FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.customer_documents cd
  JOIN public.customers c ON c.id = cd.customer_id 
  WHERE cd.id = customer_document_returns.customer_document_id AND c.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_documents_updated_at
BEFORE UPDATE ON public.customer_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_customer_number ON public.customers(customer_number);
CREATE INDEX idx_customers_full_name ON public.customers(full_name);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_email ON public.customers(email);

CREATE INDEX idx_customer_notes_customer_id ON public.customer_notes(customer_id);
CREATE INDEX idx_customer_notes_created_at ON public.customer_notes(created_at DESC);

CREATE INDEX idx_customer_vehicle_purchases_customer_id ON public.customer_vehicle_purchases(customer_id);
CREATE INDEX idx_customer_vehicle_sales_customer_id ON public.customer_vehicle_sales(customer_id);

CREATE INDEX idx_customer_documents_customer_id ON public.customer_documents(customer_id);
CREATE INDEX idx_customer_documents_type ON public.customer_documents(type);
CREATE INDEX idx_customer_documents_status ON public.customer_documents(status);

CREATE INDEX idx_customer_document_returns_customer_document_id ON public.customer_document_returns(customer_document_id);