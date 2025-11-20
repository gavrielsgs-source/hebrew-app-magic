-- Make all storage buckets private
UPDATE storage.buckets SET public = false WHERE name IN ('cars', 'customer-documents', 'documents');

-- Drop any existing policies on storage.objects for these buckets
DROP POLICY IF EXISTS "Users can view their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Add RLS policies for storage.objects

-- Policy for cars bucket - users can view their own car images
CREATE POLICY "Users can view their own car images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own car images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own car images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own car images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for customer-documents bucket
CREATE POLICY "Users can view their own customer documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'customer-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own customer documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'customer-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own customer documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'customer-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own customer documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'customer-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for documents bucket
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);