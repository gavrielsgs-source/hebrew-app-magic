-- Create customer-documents storage bucket for uploaded documents
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', true);

-- Create RLS policies for customer-documents bucket
CREATE POLICY "Users can upload documents for their customers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'customer-documents' AND 
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can view documents for their customers" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'customer-documents' AND 
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update documents for their customers" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'customer-documents' AND 
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete documents for their customers" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'customer-documents' AND 
  auth.uid()::text = split_part(name, '/', 1)
);