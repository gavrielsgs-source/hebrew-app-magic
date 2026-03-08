-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access for shared documents
CREATE POLICY "Public can read documents"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'documents');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);