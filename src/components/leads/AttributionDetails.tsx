import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";

/**
 * AttributionDetails
 * ------------------
 * Conservative UI that surfaces the future-ready attribution evidence captured
 * by the webhook. Only renders when the lead actually carries attribution data
 * (i.e. came through the Meta webhook). For the public/reviewer flow, the
 * confidence will read "low" and the method "default_safe" — that is by design
 * until ads_read / instagram_basic are approved.
 */

export interface AttributionData {
  lead_source_raw?: string | null;
  lead_source_display?: string | null;
  detection_method?: string | null;
  detection_confidence?: string | null;
  detection_error?: string | null;
  ad_id?: string | null;
  campaign_id?: string | null;
  form_id?: string | null;
  page_id?: string | null;
  enhanced_used?: boolean;
}

interface Props {
  attribution?: AttributionData | null;
}

const confidenceVariant = (c?: string | null) => {
  switch (c) {
    case "high":
      return "default" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

export function AttributionDetails({ attribution }: Props) {
  const [open, setOpen] = useState(false);

  if (!attribution || !attribution.lead_source_display) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border bg-card p-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Attribution</span>
          <Badge variant="secondary">{attribution.lead_source_display}</Badge>
          <Badge variant={confidenceVariant(attribution.detection_confidence)}>
            {attribution.detection_confidence ?? "unknown"}
          </Badge>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-1 text-xs text-muted-foreground">
        <Row label="Method" value={attribution.detection_method} />
        <Row label="Raw source" value={attribution.lead_source_raw} />
        <Row label="Enhanced" value={attribution.enhanced_used ? "yes" : "no"} />
        <Row label="Ad ID" value={attribution.ad_id} />
        <Row label="Campaign ID" value={attribution.campaign_id} />
        <Row label="Form ID" value={attribution.form_id} />
        <Row label="Page ID" value={attribution.page_id} />
        {attribution.detection_error && (
          <Row label="Error" value={attribution.detection_error} />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="font-mono text-foreground/80 break-all text-end">{value}</span>
    </div>
  );
}
