
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">תבניות הודעה</h1>
        <p className="text-muted-foreground mt-1">
          הוסף ושנה תבניות הודעה לשליחה ללקוחות
        </p>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onResetDefaults}
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          אפס לברירת מחדל
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={onNewTemplate}
          disabled={!canAddTemplate}
        >
          <Plus className="h-4 w-4 ml-2" />
          תבנית חדשה
        </Button>
      </div>
    </div>
  );
}
