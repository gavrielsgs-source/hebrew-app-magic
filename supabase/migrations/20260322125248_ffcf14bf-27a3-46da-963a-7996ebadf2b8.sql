-- Allow authenticated users to upload to documents bucket under reports/{userId}/ path
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'reports'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to read their own reports
CREATE POLICY "Users can read their own reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'reports'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to overwrite their own reports (upsert)
CREATE POLICY "Users can update their own reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'reports'
  AND (storage.foldername(name))[2] = auth.uid()::text
);