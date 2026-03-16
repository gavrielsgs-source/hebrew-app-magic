
CREATE POLICY "Admins can view all document sequences"
  ON public.document_sequences FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all document sequences"
  ON public.document_sequences FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert document sequences"
  ON public.document_sequences FOR INSERT
  WITH CHECK (is_admin());
