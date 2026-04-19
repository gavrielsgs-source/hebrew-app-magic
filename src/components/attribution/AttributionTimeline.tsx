import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAttributionEvents } from "@/hooks/attribution/use-attribution";

const labels: Record<string, string> = {
  webhook_received: "Webhook received",
  lead_retrieved: "Lead retrieved",
  safe_default_applied: "Safe default applied",
  enhanced_lookup_attempted: "Enhanced lookup attempted",
  enhanced_lookup_skipped: "Enhanced lookup skipped",
  final_attribution_assigned: "Final attribution assigned",
  manual_override_applied: "Manual override applied",
};

export function AttributionTimeline({ leadRefId }: { leadRefId: string }) {
  const { data: events = [], isLoading } = useAttributionEvents(leadRefId);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Attribution timeline</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && events.length === 0 && (
          <p className="text-sm text-muted-foreground">No events recorded for this lead.</p>
        )}
        <ol className="relative border-s border-border ps-4 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{labels[e.event_type] || e.event_type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </span>
              </div>
              {e.details && Object.keys(e.details).length > 0 && (
                <pre className="mt-1 rounded bg-muted p-2 text-xs overflow-x-auto">
                  {JSON.stringify(e.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
