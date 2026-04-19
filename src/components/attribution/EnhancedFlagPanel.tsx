import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useEnhancedFlagState } from "@/hooks/attribution/use-attribution";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Visualises the resolved enhanced state.
 * Final resolution = globalEnv (FEATURE_ENHANCED_ATTRIBUTION) AND profiles.attribution_enhanced.
 * The global env value is server-side and intentionally not exposed to the client.
 */
export function EnhancedFlagPanel() {
  const { user } = useAuth();
  const { data, isLoading } = useEnhancedFlagState();
  const qc = useQueryClient();

  const toggle = async (next: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ attribution_enhanced: next })
      .eq("id", user!.id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["enhanced-flag", user?.id] });
      toast.success(`Per-user flag ${next ? "enabled" : "disabled"}`);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Enhanced attribution flag</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Global env flag (FEATURE_ENHANCED_ATTRIBUTION)</span>
          <Badge variant="outline">server-only</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Per-user (profiles.attribution_enhanced)</span>
          <div className="flex items-center gap-2">
            <Badge variant={data?.per_user ? "default" : "outline"}>
              {isLoading ? "…" : data?.per_user ? "on" : "off"}
            </Badge>
            <Switch
              checked={!!data?.per_user}
              onCheckedChange={toggle}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="rounded-md bg-muted p-3 text-xs space-y-1">
          <p><strong>Resolution rule:</strong> enhanced = global AND per-user.</p>
          <p>
            If either side is off, the webhook stays in safe mode: no Graph
            ad-metadata calls, no <code>ads_read</code> usage, no
            <code> instagram_basic</code> usage, no Instagram label in the public UI.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
