
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TemplateHeaderProps {
  onNewTemplate: () => void;
  onResetDefaults: () => void;
}

export function TemplateHeader({ onNewTemplate, onResetDefaults }: TemplateHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">תבניות הודעה</h1>
        <p className="text-muted-foreground">ניהול תבניות לשליחת הודעות ללקוחות</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onNewTemplate}>
          <Plus className="mr-2 h-4 w-4" /> צור תבנית חדשה
        </Button>
        <Button variant="outline" onClick={onResetDefaults}>
          איפוס לברירת מחדל
        </Button>
      </div>
    </div>
  );
}
