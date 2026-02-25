import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Download, FileText, Archive, Copy, AlertTriangle, Bug, Printer } from "lucide-react";
import { ExportRunResult, downloadArtifact } from "@/hooks/use-open-format";
import { ValidationChecklist } from "./ValidationChecklist";
import { SimulatorReadiness } from "./SimulatorReadiness";
import { PrintReport54 } from "./PrintReport54";
import { PrintReport26 } from "./PrintReport26";
import { toast } from "sonner";

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
  const [showReport54, setShowReport54] = useState(false);
  const [showReport26, setShowReport26] = useState(false);
  const isSuccess = result.status === 'success';

  const copyPrimaryId = () => {
    navigator.clipboard.writeText(result.primaryId);
    toast.success('Primary ID הועתק');
  };

  if (showReport54) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowReport54(false)}>
          ← חזרה לתוצאות הייצוא
        </Button>
        <PrintReport54 exportRunId={result.exportRunId} resultData={result} />
      </div>
    );
  }

  if (showReport26) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowReport26(false)}>
          ← חזרה לתוצאות הייצוא
        </Button>
        <PrintReport26 exportRunId={result.exportRunId} resultData={result} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section 5.4 Report Button */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowReport54(true)}>
          <FileText className="h-4 w-4 ml-2" />
          הצג פלט 5.4
        </Button>
        <Button variant="outline" onClick={() => setShowReport26(true)}>
          <FileText className="h-4 w-4 ml-2" />
          הצג פלט 2.6
        </Button>
      </div>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>תוצאות ייצוא</span>
            <Badge variant={isSuccess ? 'default' : 'destructive'}>
              {isSuccess ? 'הצלחה' : 'נכשל'}
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
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold">{result.primaryId}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyPrimaryId}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
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
              {result.encoding === 'UTF-8' && (
                <span className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  לא תואם לדרישות רשות המיסים - debug בלבד
                </span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">נתיב לוגי:</span>
              <p className="font-mono text-xs">{result.logicalPath}</p>
            </div>
          </div>

          {result.error && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                <AlertTriangle className="h-4 w-4" />
                שגיאה טכנית
              </div>
              <p className="text-xs text-destructive/80 font-mono">{result.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulator Readiness */}
      <SimulatorReadiness
        validationResults={result.validationResults}
        warnings={result.warnings}
        blockers={result.blockers}
        encoding={result.encoding}
      />

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
                <TableHead>סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(result.recordCounts).map(([code, count]) => {
                const isFuture = ['100B', '110B', '100M', 'A000'].includes(code);
                return (
                  <TableRow key={code} className={isFuture ? 'opacity-50' : ''}>
                    <TableCell>{RECORD_TYPE_LABELS[code] || code}</TableCell>
                    <TableCell>
                      <Badge variant={count > 0 ? 'default' : 'secondary'}>{count}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {isFuture ? 'טרם מיושם' : count > 0 ? 'פעיל' : 'ריק'}
                    </TableCell>
                  </TableRow>
                );
              })}
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
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {result.artifacts.map((artifact) => (
              <Button
                key={artifact.type}
                variant={artifact.type === 'DEBUG_MANIFEST' ? 'ghost' : 'outline'}
                onClick={() => downloadArtifact(artifact.storagePath, artifact.filename)}
                size={artifact.type === 'DEBUG_MANIFEST' ? 'sm' : 'default'}
              >
                {artifact.type === 'ZIP' ? (
                  <Archive className="h-4 w-4 ml-2" />
                ) : artifact.type === 'DEBUG_MANIFEST' ? (
                  <Bug className="h-4 w-4 ml-2" />
                ) : (
                  <FileText className="h-4 w-4 ml-2" />
                )}
                {artifact.filename}
                <span className="text-xs text-muted-foreground mr-2">
                  ({(artifact.byteSize / 1024).toFixed(1)} KB)
                </span>
              </Button>
            ))}
          </div>
          {!isSuccess && (
            <p className="text-xs text-destructive mt-3 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              קבצים אלו נשמרו לצורכי debug בלבד - הייצוא נכשל בבדיקות ולידציה
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
