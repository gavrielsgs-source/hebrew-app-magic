import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface ExportRunResult {
  success: boolean;
  exportRunId: string;
  primaryId: string;
  logicalPath: string;
  encoding: string;
  startedAt: string;
  finishedAt: string;
  status: string;
  recordCounts: Record<string, number>;
  validationResults: Array<{ check: string; passed: boolean; detail?: string; category?: string }>;
  warnings?: string[];
  blockers?: string[];
  artifacts: Array<{ type: string; filename: string; storagePath: string; byteSize: number }>;
  error?: string;
}

export function useExportHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['open-format-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_format_export_runs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useExportRunCounts(runId: string | null) {
  return useQuery({
    queryKey: ['open-format-counts', runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('open_format_record_counts')
        .select('*')
        .eq('export_run_id', runId);
      if (error) throw error;
      return data;
    },
    enabled: !!runId,
  });
}

export function useExportRunArtifacts(runId: string | null) {
  return useQuery({
    queryKey: ['open-format-artifacts', runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('open_format_artifacts')
        .select('*')
        .eq('export_run_id', runId);
      if (error) throw error;
      return data;
    },
    enabled: !!runId,
  });
}

export function useComplianceConfig() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['open-format-config', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_format_compliance_config')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSaveComplianceConfig() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Record<string, any>) => {
      const { data: existing } = await supabase
        .from('open_format_compliance_config')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('open_format_compliance_config')
          .update(config)
          .eq('user_id', user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('open_format_compliance_config')
          .insert({ ...config, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-format-config'] });
      toast.success('ההגדרות נשמרו בהצלחה');
    },
    onError: (err: any) => {
      toast.error('שגיאה בשמירת ההגדרות: ' + err.message);
    },
  });
}

// Document type mappings hooks
export function useDocTypeMappings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['open-format-doc-mappings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_format_doc_type_mappings' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('internal_type');
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
}

export function useSaveDocTypeMapping() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mapping: { internal_type: string; tax_authority_code: string; description?: string; enabled?: boolean; notes?: string }) => {
      const { data: existing } = await supabase
        .from('open_format_doc_type_mappings' as any)
        .select('id')
        .eq('user_id', user!.id)
        .eq('internal_type', mapping.internal_type)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('open_format_doc_type_mappings' as any)
          .update({
            tax_authority_code: mapping.tax_authority_code,
            description: mapping.description,
            enabled: mapping.enabled ?? true,
            notes: mapping.notes,
          })
          .eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('open_format_doc_type_mappings' as any)
          .insert({
            user_id: user!.id,
            internal_type: mapping.internal_type,
            tax_authority_code: mapping.tax_authority_code,
            description: mapping.description,
            enabled: mapping.enabled ?? true,
            notes: mapping.notes,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-format-doc-mappings'] });
      toast.success('המיפוי נשמר בהצלחה');
    },
    onError: (err: any) => {
      toast.error('שגיאה בשמירת מיפוי: ' + err.message);
    },
  });
}

export function useGenerateExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { mode: string; taxYear?: number; startDate?: string; endDate?: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-open-format', {
        body: params,
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Export failed');
      return data as ExportRunResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-format-history'] });
    },
    onError: (err: any) => {
      toast.error('שגיאה בייצוא: ' + err.message);
    },
  });
}

export async function downloadArtifact(storagePath: string, filename: string) {
  const { data, error } = await supabase.storage
    .from('open-format-exports')
    .download(storagePath);
  if (error) {
    toast.error('שגיאה בהורדת קובץ: ' + error.message);
    return;
  }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
