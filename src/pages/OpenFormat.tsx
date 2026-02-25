import { useRoles } from "@/hooks/use-roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileDown, History, Settings, FileText, BarChart3, MapPin, Printer } from "lucide-react";
import { ExportWizard } from "@/components/open-format/ExportWizard";
import { ExportHistory } from "@/components/open-format/ExportHistory";
import { ComplianceConfig } from "@/components/open-format/ComplianceConfig";
import { DocTypeMappings } from "@/components/open-format/DocTypeMappings";
import { PrintReport54 } from "@/components/open-format/PrintReport54";
import { useExportHistory } from "@/hooks/use-open-format";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

function ReportTabContent() {
  const { data: runs, isLoading } = useExportHistory();
  const [selectedRunId, setSelectedRunId] = useState<string>("");

  if (isLoading) return <p className="text-muted-foreground text-center py-8">טוען...</p>;

  const successRuns = (runs || []).filter((r: any) => r.status === 'success');

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          בחר ריצת ייצוא להצגת פלט מודפס סעיף 5.4 (נספח 4). ניתן גם לגשת לפלט מתוך תוצאות הייצוא או ההיסטוריה.
        </AlertDescription>
      </Alert>
      <div className="space-y-2">
        <label className="text-sm font-medium">בחר ריצת ייצוא:</label>
        <Select value={selectedRunId} onValueChange={setSelectedRunId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="בחר ריצה..." />
          </SelectTrigger>
          <SelectContent>
            {successRuns.length === 0 && (
              <SelectItem value="none" disabled>אין ריצות מוצלחות</SelectItem>
            )}
            {successRuns.map((run: any) => (
              <SelectItem key={run.id} value={run.id}>
                {new Date(run.created_at).toLocaleString('he-IL')} — {run.primary_id_15} ({run.mode === 'single_year' ? `שנה ${run.tax_year}` : 'רב-שנתי'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedRunId && selectedRunId !== 'none' && (
        <PrintReport54 exportRunId={selectedRunId} />
      )}
    </div>
  );
}


export default function OpenFormat() {
  const { isAdmin, isLoading } = useRoles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-muted-foreground">טוען הרשאות...</p>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4" dir="rtl">
        <p className="text-xl font-semibold text-destructive">אין הרשאה</p>
        <p className="text-muted-foreground">עמוד זה מיועד למנהלי מערכת בלבד.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">ממשק פתוח</h1>
          <p className="text-sm text-muted-foreground">FORMAT OPEN 1.31 - ייצוא לרשות המיסים</p>
        </div>
      </div>

      <Tabs defaultValue="wizard" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            אשף ייצוא
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            היסטוריה
          </TabsTrigger>
          <TabsTrigger value="mappings" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            מיפוי מסמכים
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            הגדרות
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            פלט מודפס 5.4
          </TabsTrigger>
          <TabsTrigger value="validation" disabled className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            דוחות 2.6
            <Badge variant="secondary" className="text-xs">בקרוב</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard">
          <ExportWizard />
        </TabsContent>

        <TabsContent value="history">
          <ExportHistory />
        </TabsContent>

        <TabsContent value="mappings">
          <DocTypeMappings />
        </TabsContent>

        <TabsContent value="config">
          <ComplianceConfig />
        </TabsContent>

        <TabsContent value="report">
          <ReportTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}