import { useNavigate } from "react-router-dom";
import { useRoles } from "@/hooks/use-roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileDown, History, Settings, FileText, BarChart3, MapPin } from "lucide-react";
import { ExportWizard } from "@/components/open-format/ExportWizard";
import { ExportHistory } from "@/components/open-format/ExportHistory";
import { ComplianceConfig } from "@/components/open-format/ComplianceConfig";
import { DocTypeMappings } from "@/components/open-format/DocTypeMappings";
import { useEffect } from "react";

export default function OpenFormat() {
  const { isAdmin, isLoading } = useRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin()) {
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-muted-foreground">טוען הרשאות...</p>
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
          <TabsTrigger value="report" disabled className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            דוח מודפס
            <Badge variant="secondary" className="text-xs">בקרוב</Badge>
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
      </Tabs>
    </div>
  );
}