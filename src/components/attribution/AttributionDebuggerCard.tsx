import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttributionRow } from "@/hooks/attribution/use-attribution";

/**
 * Internal debugger view. Shows raw attribution evidence for a lead.
 * Renders nothing public-facing — only mounted inside admin views/drawers.
 */
export function AttributionDebuggerCard({
  row,
  enhancedActive,
}: {
  row: AttributionRow | null | undefined;
  enhancedActive: boolean;
}) {
  if (!row) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Attribution debugger</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No attribution row stored. The webhook ran in safe mode (enhanced flag off) or this lead
          was not received via Meta.
        </CardContent>
      </Card>
    );
  }
  const fields: Array<[string, string | null | undefined]> = [
    ["source_display", row.lead_source_display],
    ["source_raw", row.lead_source_raw],
    ["detection_method", row.detection_method],
    ["detection_confidence", row.detection_confidence],
    ["detection_error", row.detection_error],
    ["ad_id", row.ad_id],
    ["campaign_id", row.campaign_id],
    ["form_id", row.form_id],
    ["page_id", row.page_id],
  ];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Attribution debugger</CardTitle>
        <Badge variant={enhancedActive ? "default" : "outline"}>
          enhanced: {enhancedActive ? "active" : "off"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {fields.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-border/50 py-1">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-mono break-all text-end">{v || "—"}</span>
          </div>
        ))}
        {row.override_value && (
          <div className="rounded-md bg-muted p-2 text-xs">
            <div className="font-semibold mb-1">Manual override active (internal)</div>
            <div>value: {row.override_value}</div>
            <div>reason: {row.override_reason || "—"}</div>
            <div>at: {row.overridden_at || "—"}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
