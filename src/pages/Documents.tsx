import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsManager } from "@/components/documents/DocumentsManager";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";
import { FileText } from "lucide-react";

export default function Documents() {
  const isMobile = useIsMobile();
  
  // הגדרת כיוון ה-RTL לתמיכה בעברית
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);
  
  return (
    <div className={`container py-4 md:py-6 ${isMobile ? 'px-2 pb-24' : ''}`}>
      <StandardPageHeader
        title="ניהול מסמכים"
        subtitle="ניהול חוזים, מסמכים משפטיים ותיעוד עסקאות"
        icon={FileText}
      />

      <Card className="rounded-2xl shadow-sm border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-right pb-4">
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>כל המסמכים</CardTitle>
          <CardDescription className={`${isMobile ? 'text-sm' : ''}`}>
            צפייה בכל המסמכים שנשמרו במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentsManager />
        </CardContent>
      </Card>
    </div>
  );
}
