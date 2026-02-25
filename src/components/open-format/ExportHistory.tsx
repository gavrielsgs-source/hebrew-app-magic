import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Eye } from "lucide-react";
import { useExportHistory, useExportRunArtifacts, downloadArtifact } from "@/hooks/use-open-format";

export function ExportHistory() {
  const { data: runs, isLoading } = useExportHistory();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { data: artifacts } = useExportRunArtifacts(selectedRunId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>היסטוריית ייצוא</CardTitle>
      </CardHeader>
      <CardContent>
        {!runs?.length ? (
          <p className="text-muted-foreground text-center py-8">לא בוצעו ייצואים עדיין</p>
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
                <TableHead>סימולטור</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run: any) => (
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
                  <TableCell className="text-xs text-muted-foreground">
                    {run.simulator_status || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
