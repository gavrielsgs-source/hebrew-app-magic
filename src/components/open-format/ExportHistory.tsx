import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Search, Filter, FileText, BarChart3 } from "lucide-react";
import { useExportHistory, useExportRunArtifacts, downloadArtifact } from "@/hooks/use-open-format";
import { PrintReport54 } from "./PrintReport54";
import { PrintReport26 } from "./PrintReport26";

export function ExportHistory() {
  const { data: runs, isLoading } = useExportHistory();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [reportRunId, setReportRunId] = useState<string | null>(null);
  const [report26RunId, setReport26RunId] = useState<string | null>(null);
  const { data: artifacts } = useExportRunArtifacts(selectedRunId);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [searchId, setSearchId] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const filteredRuns = (runs || []).filter((run: any) => {
    if (statusFilter !== "all" && run.status !== statusFilter) return false;
    if (modeFilter !== "all" && run.mode !== modeFilter) return false;
    if (searchId && !run.primary_id_15?.includes(searchId)) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>היסטוריית ייצוא</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-end">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">סטטוס</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="success">הצלחה</SelectItem>
                <SelectItem value="failed">נכשל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">מצב</span>
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="single_year">שנה בודדת</SelectItem>
                <SelectItem value="multi_year">רב-שנתי</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">חיפוש Primary ID</span>
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-8 w-48"
                placeholder="חפש..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {!filteredRuns.length ? (
          <p className="text-muted-foreground text-center py-8">
            {runs?.length ? 'לא נמצאו תוצאות לפי הסינון' : 'לא בוצעו ייצואים עדיין'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>תאריך</TableHead>
                <TableHead>מצב</TableHead>
                <TableHead>תקופה</TableHead>
                <TableHead>Primary ID</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>קידוד</TableHead>
                <TableHead>נתיב לוגי</TableHead>
                <TableHead>סימולטור</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run: any) => (
                <TableRow key={run.id}>
                  <TableCell className="text-xs">
                    {new Date(run.created_at).toLocaleString('he-IL')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {run.mode === 'single_year' ? 'שנה בודדת' : 'רב-שנתי'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {run.mode === 'single_year'
                      ? run.tax_year
                      : `${run.start_date} - ${run.end_date}`}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{run.primary_id_15}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        run.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : run.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {run.status === 'success' ? 'הצלחה' : run.status === 'failed' ? 'נכשל' : 'ממתין'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{run.encoding_used}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate" title={run.logical_output_path}>
                    {run.logical_output_path}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {run.simulator_status || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                        title="הורד קבצים"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReportRunId(reportRunId === run.id ? null : run.id)}
                        title="פלט 5.4"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReport26RunId(report26RunId === run.id ? null : run.id)}
                        title="פלט 2.6"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Artifact download panel */}
        {selectedRunId && artifacts && artifacts.length > 0 && (
          <div className="mt-4 p-4 border rounded-md bg-muted/30">
            <p className="text-sm font-medium mb-2">הורדת קבצים:</p>
            <div className="flex gap-2 flex-wrap">
              {artifacts.map((a: any) => (
                <Button
                  key={a.id}
                  variant="outline"
                  size="sm"
                  onClick={() => downloadArtifact(a.storage_path, a.filename)}
                >
                  <Download className="h-3 w-3 ml-1" />
                  {a.filename}
                  {a.byte_size && (
                    <span className="text-xs text-muted-foreground mr-1">
                      ({(a.byte_size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Section 5.4 Report Panel */}
        {reportRunId && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">פלט מודפס 5.4:</p>
              <Button variant="ghost" size="sm" onClick={() => setReportRunId(null)}>סגור</Button>
            </div>
            <PrintReport54 exportRunId={reportRunId} />
          </div>
        )}

        {/* Section 2.6 Report Panel */}
        {report26RunId && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">פלט מודפס 2.6:</p>
              <Button variant="ghost" size="sm" onClick={() => setReport26RunId(null)}>סגור</Button>
            </div>
            <PrintReport26 exportRunId={report26RunId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
