import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Download, FileText, Archive } from "lucide-react";
import { ExportRunResult, downloadArtifact } from "@/hooks/use-open-format";
import { ValidationChecklist } from "./ValidationChecklist";

const RECORD_TYPE_LABELS: Record<string, string> = {
  '100A': 'רשומת פתיחה (100A)',
  '100C': 'כותרת מסמך (100C)',
  '110D': 'שורת פירוט (110D)',
  '120D': 'פרטי תשלום (120D)',
  '100B': 'כותרת חשבון (100B) - עתידי',
  '110B': 'תנועת יומן (110B) - עתידי',
  '100M': 'מלאי (100M) - עתידי',
  '900Z': 'רשומת סגירה (900Z)',
  'A000': 'רשומה כללית (A000) - עתידי',
};

interface ExportResultsProps {
  result: ExportRunResult;
}

export function ExportResults({ result }: ExportResultsProps) {
  const statusColor = result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>תוצאות ייצוא</span>
            <Badge className={statusColor}>
              {result.status === 'success' ? 'הצלחה' : 'נכשל'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Export Run ID:</span>
              <p className="font-mono text-xs">{result.exportRunId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Primary ID (15 ספרות):</span>
              <p className="font-mono font-bold">{result.primaryId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">זמן התחלה:</span>
              <p>{new Date(result.startedAt).toLocaleString('he-IL')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">זמן סיום:</span>
              <p>{new Date(result.finishedAt).toLocaleString('he-IL')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">קידוד:</span>
              <p>{result.encoding}</p>
            </div>
            <div>
              <span className="text-muted-foreground">נתיב לוגי:</span>
              <p className="font-mono text-xs">{result.logicalPath}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Counts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ספירת רשומות לפי סוג</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>סוג רשומה</TableHead>
                <TableHead>כמות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(result.recordCounts).map(([code, count]) => (
                <TableRow key={code}>
                  <TableCell>{RECORD_TYPE_LABELS[code] || code}</TableCell>
                  <TableCell>
                    <Badge variant={count > 0 ? 'default' : 'secondary'}>{count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation */}
      <ValidationChecklist results={result.validationResults} />

      {/* Download Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">הורדת קבצים</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          {result.artifacts.map((artifact) => (
            <Button
              key={artifact.type}
              variant="outline"
              onClick={() => downloadArtifact(artifact.storagePath, artifact.filename)}
            >
              {artifact.type === 'ZIP' ? (
                <Archive className="h-4 w-4 ml-2" />
              ) : (
                <FileText className="h-4 w-4 ml-2" />
              )}
              {artifact.filename}
              <span className="text-xs text-muted-foreground mr-2">
                ({(artifact.byteSize / 1024).toFixed(1)} KB)
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
