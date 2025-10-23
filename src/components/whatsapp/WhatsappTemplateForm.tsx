
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WhatsappTemplate } from "./whatsapp-templates";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhatsappTemplateFormProps {
  templates: WhatsappTemplate[];
  selectedTemplateId: string;
  customizedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onCustomizedTemplateChange: (template: string) => void;
}

export function WhatsappTemplateForm({
  templates,
  selectedTemplateId,
  customizedTemplate,
  onTemplateChange,
  onCustomizedTemplateChange,
}: WhatsappTemplateFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          בחר תבנית
        </label>
        <Select
          value={selectedTemplateId}
          onValueChange={onTemplateChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר תבנית" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          ערוך תבנית
        </label>
        <Textarea
          rows={10}
          value={customizedTemplate}
          onChange={(e) => onCustomizedTemplateChange(e.target.value)}
          className="mb-2 font-mono text-sm"
          dir="rtl"
        />
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            אתה יכול לערוך את הטקסט להתאמה אישית לפני השליחה.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800 font-medium mb-1">⚠️ חשוב לדעת:</p>
            <p className="text-xs text-orange-700">
              הודעות עם נוסח חופשי (לא תבניות מאושרות) ניתן לשלוח רק אם הלקוח יצר קשר עם הבוט בתוך 24 שעות האחרונות מההודעה האחרונה שלו. אחרת, יש להשתמש בתבניות מאושרות בלבד.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
