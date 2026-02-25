
-- Document type mapping table for Open Format compliance
CREATE TABLE public.open_format_doc_type_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  internal_type text NOT NULL,
  tax_authority_code text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint per user + internal type
ALTER TABLE public.open_format_doc_type_mappings
  ADD CONSTRAINT uq_user_doc_type UNIQUE (user_id, internal_type);

-- RLS
ALTER TABLE public.open_format_doc_type_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mappings"
  ON public.open_format_doc_type_mappings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all mappings"
  ON public.open_format_doc_type_mappings FOR SELECT
  USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_doc_type_mappings_updated_at
  BEFORE UPDATE ON public.open_format_doc_type_mappings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
