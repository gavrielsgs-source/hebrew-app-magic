import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Empty-state placeholders for future re-request:
 *   - linked Instagram account status (needs instagram_basic)
 *   - ad metadata evidence panel (needs ads_read)
 *   - long-form attribution explanation
 *
 * Rendered only in admin views; their existence demonstrates that the UI is
 * wired and ready as soon as Meta approves the additional permissions.
 */
export function InstagramLinkagePanel() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Linked Instagram account</CardTitle>
        <Badge variant="outline">requires instagram_basic</Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Will display the Instagram Business account linked to the Page once
        <code> instagram_basic</code> is approved. UI hook is ready in
        <code> attribution.ts → lookupInstagramLinkage()</code>.
      </CardContent>
    </Card>
  );
}

export function AdMetadataPanel({ adId }: { adId?: string | null }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Ad metadata evidence</CardTitle>
        <Badge variant="outline">requires ads_read</Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {adId ? <>Ad ID on file: <code>{adId}</code>.</> : "No ad_id captured for this lead."}
        <p className="mt-2">
          Once <code>ads_read</code> is granted we will populate
          campaign / adset / IG actor evidence here automatically.
        </p>
      </CardContent>
    </Card>
  );
}

export function AttributionExplanation({ display }: { display?: string | null }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Attribution explanation</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>
          Public reviewer flow currently labels this lead as <strong>{display || "Facebook"}</strong>{" "}
          using only data Meta returns through the approved <code>leads_retrieval</code> scope.
        </p>
        <p>
          When enhanced mode is enabled (admin + per-user opt-in + global env), we additionally
          inspect ad metadata to distinguish Facebook vs Instagram with high confidence.
        </p>
      </CardContent>
    </Card>
  );
}
