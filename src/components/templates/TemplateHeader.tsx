
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, MessageSquare } from "lucide-react";

interface TemplateHeaderProps {
  onNewTemplate: () => void;
  onResetDefaults: () => void;
  canAddTemplate?: boolean;
}

export function TemplateHeader({ 
  onNewTemplate, 
  onResetDefaults,
  canAddTemplate = true 
}: TemplateHeaderProps) {
  return (
    <div className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple rounded-lg p-6 mb-8 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="text-right flex-1">
          <div className="flex items-center justify-end gap-3 mb-2">
            <h1 className="text-3xl font-bold">תבניות הודעה</h1>
            <MessageSquare className="h-8 w-8" />
          </div>
          <p className="text-white/90 text-lg">
            נהל והתאם אישית תבניות הודעות לשליחה ללקוחות
          </p>
          <p className="text-white/70 text-sm mt-1">
            צור תבניות מותאמות אישית עם משתנים דינמיים לפרטי הרכב
          </p>
        </div>
        
        <div className="flex gap-3 mt-6 sm:mt-0 sm:mr-6">
          <Button
            variant="outline"
            size="default"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
            onClick={onResetDefaults}
          >
            <RefreshCw className="h-4 w-4" />
            אפס לברירת מחדל
          </Button>
          <Button
            size="default"
            className="bg-white text-carslead-purple hover:bg-white/90 flex items-center gap-2 font-semibold"
            onClick={onNewTemplate}
            disabled={!canAddTemplate}
          >
            <Plus className="h-4 w-4" />
            תבנית חדשה
          </Button>
        </div>
      </div>
    </div>
  );
}
