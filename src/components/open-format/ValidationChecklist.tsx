import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

interface ValidationChecklistProps {
  results: Array<{ check: string; passed: boolean; detail?: string }>;
}

export function ValidationChecklist({ results }: ValidationChecklistProps) {
  const allPassed = results.every((r) => r.passed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {allPassed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          בדיקות ולידציה פנימיות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {r.passed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              )}
              <div>
                <span>{r.check}</span>
                {r.detail && (
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
