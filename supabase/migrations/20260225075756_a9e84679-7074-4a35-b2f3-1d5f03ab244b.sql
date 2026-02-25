
-- =============================================
-- Open Format 1.31 - Compliance Module Tables
-- =============================================

-- 1. Export Runs
CREATE TABLE public.open_format_export_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'single_year',
  tax_year integer,
  start_date date,
  end_date date,
  primary_id_15 text NOT NULL,
  logical_output_path text NOT NULL,
  encoding_used text NOT NULL DEFAULT 'ISO-8859-8',
  compression_name text NOT NULL DEFAULT 'BKMVDATA.zip',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  error_message text,
  simulator_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.open_format_export_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all export runs"
  ON public.open_format_export_runs FOR ALL
  USING (is_admin());

CREATE POLICY "Users can view their own export runs"
  ON public.open_format_export_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export runs"
  ON public.open_format_export_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export runs"
  ON public.open_format_export_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Record Counts
CREATE TABLE public.open_format_record_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_run_id uuid NOT NULL REFERENCES public.open_format_export_runs(id) ON DELETE CASCADE,
  record_type_code text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.open_format_record_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view counts for their runs"
  ON public.open_format_record_counts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.open_format_export_runs r
    WHERE r.id = open_format_record_counts.export_run_id
    AND (r.user_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "System can insert record counts"
  ON public.open_format_record_counts FOR INSERT
  WITH CHECK (true);

-- 3. Artifacts
CREATE TABLE public.open_format_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_run_id uuid NOT NULL REFERENCES public.open_format_export_runs(id) ON DELETE CASCADE,
  artifact_type text NOT NULL,
  filename text NOT NULL,
  storage_path text NOT NULL,
  checksum text,
  byte_size integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.open_format_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view artifacts for their runs"
  ON public.open_format_artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.open_format_export_runs r
    WHERE r.id = open_format_artifacts.export_run_id
    AND (r.user_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "System can insert artifacts"
  ON public.open_format_artifacts FOR INSERT
  WITH CHECK (true);

-- 4. Compliance Config
CREATE TABLE public.open_format_compliance_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  software_registration_number text,
  software_name text DEFAULT 'CarsLead',
  software_version text DEFAULT '1.0',
  software_vendor_name text DEFAULT 'CarsLead Ltd',
  software_vendor_tax_id text,
  default_encoding text DEFAULT 'ISO-8859-8',
  currency_code text DEFAULT 'ILS',
  branches_enabled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.open_format_compliance_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own config"
  ON public.open_format_compliance_config FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all configs"
  ON public.open_format_compliance_config FOR SELECT
  USING (is_admin());

-- Indexes
CREATE INDEX idx_export_runs_user_id ON public.open_format_export_runs(user_id);
CREATE INDEX idx_export_runs_status ON public.open_format_export_runs(status);
CREATE INDEX idx_record_counts_run_id ON public.open_format_record_counts(export_run_id);
CREATE INDEX idx_artifacts_run_id ON public.open_format_artifacts(export_run_id);

-- Updated_at triggers
CREATE TRIGGER update_open_format_export_runs_updated_at
  BEFORE UPDATE ON public.open_format_export_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_open_format_compliance_config_updated_at
  BEFORE UPDATE ON public.open_format_compliance_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('open-format-exports', 'open-format-exports', false);

-- Storage policies
CREATE POLICY "Users can view their own exports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'open-format-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can upload exports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'open-format-exports');

CREATE POLICY "Users can download their own exports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'open-format-exports' AND is_admin());
