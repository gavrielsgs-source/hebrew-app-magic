import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Shield } from "lucide-react";

interface SimulatorReadinessProps {
  validationResults: Array<{ check: string; passed: boolean; detail?: string; category?: string }>;
  warnings?: string[];
  blockers?: string[];
  encoding: string;
  hasComplianceConfig?: boolean;
}

export function SimulatorReadiness({ validationResults, warnings = [], blockers = [], encoding, hasComplianceConfig }: SimulatorReadinessProps) {
  const blockingResults = validationResults.filter(r => r.category === 'blocking');
  const warningResults = validationResults.filter(r => r.category === 'warning');
  const allBlockingPassed = blockingResults.every(r => r.passed);
  const encodingCompliant = encoding !== 'UTF-8';

  const readinessItems = [
    { label: 'הגדרות רשומות תקינות', passed: !blockingResults.find(r => r.check.includes('הגדרות רשומות'))?.passed === false },
    { label: 'הגדרות ציות עסקיות קיימות', passed: hasComplianceConfig !== false },
    { label: 'מיפוי סוגי מסמכים שלם', passed: !warningResults.find(r => r.check.includes('מיפוי') && !r.passed) },
    { label: 'קידוד תואם לרשות המיסים', passed: encodingCompliant, detail: encoding },
    { label: 'בדיקות ליבה עברו', passed: allBlockingPassed },
  ];

  const overallReady = readinessItems.every(r => r.passed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5" />
          מוכנות לסימולטור
          <Badge className={overallReady ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {overallReady ? 'מוכן' : 'דורש תיקון'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {readinessItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {item.passed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              <span>{item.label}</span>
              {item.detail && <span className="text-xs text-muted-foreground">({item.detail})</span>}
            </li>
          ))}
        </ul>

        {warnings.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              אזהרות (לא חוסמות)
            </h4>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground pr-5">• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {blockers.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium flex items-center gap-1 mb-1 text-destructive">
              <XCircle className="h-4 w-4" />
              בעיות חוסמות (חובה לתקן)
            </h4>
            <ul className="space-y-1">
              {blockers.map((b, i) => (
                <li key={i} className="text-xs text-destructive/80 pr-5">• {b}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground border-t pt-3 mt-3">
          בדיקה פנימית בלבד — לא מהווה אישור סימולטור של רשות המיסים.
        </p>
      </CardContent>
    </Card>
  );
}
