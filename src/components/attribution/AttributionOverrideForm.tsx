import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useApplyOverride } from "@/hooks/attribution/use-attribution";

type Source = "Facebook" | "Instagram" | "Meta" | "Unknown";

/**
 * Admin-only manual source override.
 * RLS enforces admin-only writes on lead_attributions overrides.
 */
export function AttributionOverrideForm({
  leadRefId,
  ownerUserId,
  current,
}: {
  leadRefId: string;
  ownerUserId: string;
  current: string | null;
}) {
  const [value, setValue] = useState<Source | "">((current as Source) || "");
  const [reason, setReason] = useState("");
  const apply = useApplyOverride();

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Manual source override (admin)</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={value} onValueChange={(v) => setValue(v as Source)}>
          <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
          <SelectContent>
            {(["Facebook","Instagram","Meta","Unknown"] as Source[]).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Reason (required when applying)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            disabled={!value || !reason || apply.isPending}
            onClick={() =>
              apply.mutate({ leadRefId, ownerUserId, override: value as Source, reason })
            }
          >
            Apply override
          </Button>
          <Button
            variant="outline"
            disabled={apply.isPending}
            onClick={() =>
              apply.mutate({ leadRefId, ownerUserId, override: null, reason: "" })
            }
          >
            Clear override
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Internal-only. Override values do NOT change the public/reviewer label and are visible
          only inside admin tooling.
        </p>
      </CardContent>
    </Card>
  );
}
