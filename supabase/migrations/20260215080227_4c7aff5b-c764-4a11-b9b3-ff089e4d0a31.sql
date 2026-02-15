
-- Create document_shares table for secure document sharing
CREATE TABLE public.document_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.customer_documents(id) ON DELETE CASCADE,
  share_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  user_id uuid NOT NULL,
  file_path text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_viewed_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  download_count integer NOT NULL DEFAULT 0
);

-- Index for fast lookup by share_id
CREATE INDEX idx_document_shares_share_id ON public.document_shares (share_id);

-- Enable RLS
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own shares
CREATE POLICY "Users can create their own shares"
  ON public.document_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shares"
  ON public.document_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares"
  ON public.document_shares FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
  ON public.document_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Public (anon) read access: only valid, non-expired, non-revoked shares
CREATE POLICY "Public can view active shares by share_id"
  ON public.document_shares FOR SELECT
  USING (
    revoked_at IS NULL
    AND expires_at > now()
  );
