-- Drop overly permissive storage policies for customer-documents bucket
DROP POLICY IF EXISTS "Users can read customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update customer documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload customer documents" ON storage.objects;

-- Drop overly permissive storage policy for documents bucket
DROP POLICY IF EXISTS "Users can read any document file" ON storage.objects;