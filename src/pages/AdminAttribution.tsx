import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRealAdminCheck } from "@/hooks/use-real-admin-check";
import { useAllAttributions } from "@/hooks/attribution/use-attribution";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnhancedFlagPanel } from "@/components/attribution/EnhancedFlagPanel";
import { AttributionAdminDrawer } from "@/components/attribution/AttributionAdminDrawer";

/**
 * Admin-only reporting view for internal attribution tooling.
 * Route: /admin/attribution (guarded by useRealAdminCheck + RLS).
 * Public/reviewer flow is unaffected by this page.
 */
export default function AdminAttribution() {
  const { isAdmin, isLoading } = useRealAdminCheck();
  const { data: rows = [], isLoading: rowsLoading } = useAllAttributions();
  const [source, setSource] = useState("all");
  const [method, setMethod] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [overrideFilter, setOverrideFilter] = useState("all");
  const [missingEvidence, setMissingEvidence] = useState("all");
  const [selected, setSelected] = useState<{ id: string; user_id: string } | null>(null);

  const filtered = useMemo(() => rows.filter((r) => {
    if (source !== "all" && r.lead_source_display !== source) return false;
    if (method !== "all" && r.detection_method !== method) return false;
    if (confidence !== "all" && r.detection_confidence !== confidence) return false;
    if (overrideFilter === "overridden" && !r.override_value) return false;
    if (overrideFilter === "automatic" && r.override_value) return false;
    if (missingEvidence === "missing" &&
        r.evidence && Object.keys(r.evidence).length > 0) return false;
    return true;
  }), [rows, source, method, confidence, overrideFilter, missingEvidence]);

  const summary = useMemo(() => {
    const by = (key: keyof typeof rows[number]) => {
      const map = new Map<string, number>();
      rows.forEach((r) => {
        const k = (r[key] as string) || "—";
        map.set(k, (map.get(k) || 0) + 1);
      });
      return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    };
    return {
      bySource: by("lead_source_display"),
      byMethod: by("detection_method"),
      byConfidence: by("detection_confidence"),
      overridden: rows.filter((r) => r.override_value).length,
      total: rows.length,
    };
  }, [rows]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading…</div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Attribution (internal)</h1>
        <p className="text-muted-foreground">
          Admin-only reporting and overrides. Does not affect the public/reviewer flow.
        </p>
      </div>

      <EnhancedFlagPanel />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="By source" entries={summary.bySource} />
        <SummaryCard title="By method" entries={summary.byMethod} />
        <SummaryCard title="By confidence" entries={summary.byConfidence} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Totals</CardTitle></CardHeader>
        <CardContent className="text-sm flex gap-6">
          <div>Total rows: <strong>{summary.total}</strong></div>
          <div>Overridden: <strong>{summary.overridden}</strong></div>
          <div>Automatic: <strong>{summary.total - summary.overridden}</strong></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <FilterSelect value={source} onChange={setSource} label="Source"
            options={["all","Facebook","Instagram","Meta","Unknown"]} />
          <FilterSelect value={method} onChange={setMethod} label="Method"
            options={["all","default_safe","ad_metadata_instagram_actor","ad_metadata_no_instagram_markers","ad_lookup_failed","ad_lookup_exception","no_ad_id"]} />
          <FilterSelect value={confidence} onChange={setConfidence} label="Confidence"
            options={["all","none","low","medium","high"]} />
          <FilterSelect value={overrideFilter} onChange={setOverrideFilter} label="Override"
            options={["all","overridden","automatic"]} />
          <FilterSelect value={missingEvidence} onChange={setMissingEvidence} label="Evidence"
            options={["all","missing"]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Rows ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {rowsLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ref</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.lead_ref_id}</TableCell>
                    <TableCell><Badge variant="secondary">{r.lead_source_display || "—"}</Badge></TableCell>
                    <TableCell className="text-xs">{r.detection_method || "—"}</TableCell>
                    <TableCell className="text-xs">{r.detection_confidence || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {r.override_value ? <Badge>{r.override_value}</Badge> : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline"
                        onClick={() => setSelected({ id: r.lead_ref_id, user_id: r.user_id })}>
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selected && (
        <AttributionAdminDrawer
          open
          onOpenChange={(v) => !v && setSelected(null)}
          leadRefId={selected.id}
          ownerUserId={selected.user_id}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, entries }: { title: string; entries: Array<[string, number]> }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-1 text-sm">
        {entries.length === 0 && <p className="text-muted-foreground">No data</p>}
        {entries.map(([k, n]) => (
          <div key={k} className="flex justify-between">
            <span>{k}</span><strong>{n}</strong>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value, onChange, label, options,
}: { value: string; onChange: (v: string) => void; label: string; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
