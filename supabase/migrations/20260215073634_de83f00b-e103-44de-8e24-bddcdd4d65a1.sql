
-- Allow authenticated users to upload to customer-documents bucket
CREATE POLICY "Users can upload customer documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'customer-documents');

-- Allow authenticated users to update (upsert) their files
CREATE POLICY "Users can update customer documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'customer-documents');

-- Allow authenticated users to read their uploaded documents
CREATE POLICY "Users can read customer documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'customer-documents');
