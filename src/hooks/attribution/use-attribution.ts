import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

/**
 * Internal-only attribution hooks.
 * - Reads lead_attributions (owner or admin via RLS).
 * - Reads attribution_events timeline (owner or admin).
 * - Override mutations are admin-only at the DB level.
 * - Per-user enhanced flag read/write lives on profiles.attribution_enhanced.
 *
 * NOTE: These hooks do NOT change anything in the public/reviewer flow.
 *       They surface internal evidence captured by the webhook.
 */

export type AttributionRow = {
  id: string;
  user_id: string;
  lead_ref_id: string;
  lead_source_table: string;
  lead_source_display: string | null;
  lead_source_raw: string | null;
  detection_method: string | null;
  detection_confidence: string | null;
  detection_error: string | null;
  ad_id: string | null;
  campaign_id: string | null;
  form_id: string | null;
  page_id: string | null;
  evidence: Record<string, unknown> | null;
  override_value: string | null;
  override_reason: string | null;
  overridden_by: string | null;
  overridden_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttributionEvent = {
  id: string;
  user_id: string;
  lead_ref_id: string;
  event_type: string;
  details: Record<string, unknown> | null;
  actor_id: string | null;
  created_at: string;
};

export const useAttributionForLead = (leadRefId?: string | null) =>
  useQuery({
    queryKey: ["attribution", leadRefId],
    enabled: !!leadRefId,
    queryFn: async (): Promise<AttributionRow | null> => {
      const { data, error } = await supabase
        .from("lead_attributions")
        .select("*")
        .eq("lead_ref_id", leadRefId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AttributionRow | null;
    },
  });

export const useAttributionEvents = (leadRefId?: string | null) =>
  useQuery({
    queryKey: ["attribution-events", leadRefId],
    enabled: !!leadRefId,
    queryFn: async (): Promise<AttributionEvent[]> => {
      const { data, error } = await supabase
        .from("attribution_events")
        .select("*")
        .eq("lead_ref_id", leadRefId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as AttributionEvent[];
    },
  });

export const useAllAttributions = () =>
  useQuery({
    queryKey: ["attributions-all"],
    queryFn: async (): Promise<AttributionRow[]> => {
      const { data, error } = await supabase
        .from("lead_attributions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []) as unknown as AttributionRow[];
    },
  });

export const useApplyOverride = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (vars: {
      leadRefId: string;
      ownerUserId: string;
      override: "Facebook" | "Instagram" | "Meta" | "Unknown" | null;
      reason: string;
    }) => {
      const now = new Date().toISOString();
      // Upsert: if no row exists yet (safe-mode lead), create one. RLS lets admins do this.
      const { error } = await supabase
        .from("lead_attributions")
        .upsert(
          {
            user_id: vars.ownerUserId,
            lead_source_table: "facebook_leads",
            lead_ref_id: vars.leadRefId,
            override_value: vars.override,
            override_reason: vars.override ? vars.reason : null,
            overridden_by: vars.override ? user?.id ?? null : null,
            overridden_at: vars.override ? now : null,
          },
          { onConflict: "user_id,lead_source_table,lead_ref_id" },
        );
      if (error) throw error;

      await supabase.from("attribution_events").insert({
        user_id: vars.ownerUserId,
        lead_ref_id: vars.leadRefId,
        event_type: "manual_override_applied",
        actor_id: user?.id ?? null,
        details: { override: vars.override, reason: vars.reason },
      });
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["attribution", vars.leadRefId] });
      qc.invalidateQueries({ queryKey: ["attribution-events", vars.leadRefId] });
      qc.invalidateQueries({ queryKey: ["attributions-all"] });
      toast.success("Override applied");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useEnhancedFlagState = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enhanced-flag", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("attribution_enhanced")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      // Global flag is server-side env. We can't read it from the client; we
      // reflect a "client view" only — final resolution still happens in the
      // edge function (global && perUser).
      return {
        per_user: !!data?.attribution_enhanced,
      };
    },
  });
};
