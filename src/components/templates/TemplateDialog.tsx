
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles } from "lucide-react";

interface TemplateDialogProps {
  isOpen: boolean;
  isNew: boolean;
  newTemplate: WhatsappTemplate;
  setIsOpen: (open: boolean) => void;
  onSave: () => void;
  onTemplateChange: (template: WhatsappTemplate) => void;
  templateTags: string[];
}

export function TemplateDialog({
  isOpen,
  isNew,
  newTemplate,
  setIsOpen,
  onSave,
  onTemplateChange,
  templateTags
}: TemplateDialogProps) {
  const { toast } = useToast();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl flex items-center justify-end gap-2">
            {isNew ? 'תבנית חדשה' : 'עריכת תבנית'}
            <Sparkles className="h-6 w-6 text-carslead-purple" />
          </DialogTitle>
          <DialogDescription className="text-right text-base">
            צור תבנית מותאמת אישית לשליחת הודעות. השתמש במשתנים כמו {"{"}make{"}"}, {"{"}model{"}"} וכו' כדי לכלול פרטים דינמיים מהרכב.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right text-sm font-medium">
              שם התבנית
            </Label>
            <Input
              id="name"
              value={newTemplate.name}
              onChange={(e) => onTemplateChange({ ...newTemplate, name: e.target.value })}
              placeholder="לדוגמה: תבנית תיאום פגישה"
              className="text-right"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template" className="text-right text-sm font-medium">
              תוכן התבנית
            </Label>
            <Textarea
              id="template"
              value={newTemplate.template}
              onChange={(e) => onTemplateChange({ ...newTemplate, template: e.target.value })}
              className="min-h-[200px] text-right font-mono text-sm leading-relaxed"
              placeholder="שלום,&#10;&#10;רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:&#10;&#10;*{{make}} {{model}} {{year}}*&#10;מחיר: {{price}}&#10;..."
              dir="rtl"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm font-medium">תגיות זמינות:</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {templateTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-carslead-purple hover:text-white transition-colors"
                  onClick={() => {
                    onTemplateChange({
                      ...newTemplate,
                      template: newTemplate.template + tag
                    });
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-right">
              לחץ על תגית כדי להוסיף אותה לתבנית
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="px-6"
          >
            ביטול
          </Button>
          <Button 
            type="submit" 
            onClick={onSave}
            className="bg-carslead-purple hover:bg-carslead-purple/90 px-6"
          >
            {isNew ? 'שמור תבנית' : 'עדכן תבנית'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
