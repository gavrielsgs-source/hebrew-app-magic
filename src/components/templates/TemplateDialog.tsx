
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { useToast } from "@/hooks/use-toast";

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'תבנית חדשה' : 'עריכת תבנית'}</DialogTitle>
          <DialogDescription>
            צור תבנית מותאמת אישית לשליחת הודעות. השתמש ב-{"{"}make{"}"}, {"{"}model{"}"}, וכו' כדי לכלול פרטים מהרכב.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם התבנית
            </Label>
            <Input
              id="name"
              value={newTemplate.name}
              onChange={(e) => onTemplateChange({ ...newTemplate, name: e.target.value })}
              className="col-span-3"
              placeholder="תבנית תיאום פגישה"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template" className="text-right">
              תוכן התבנית
            </Label>
            <Textarea
              id="template"
              value={newTemplate.template}
              onChange={(e) => onTemplateChange({ ...newTemplate, template: e.target.value })}
              className="col-span-3"
              rows={10}
              placeholder="שלום,&#10;&#10;רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:&#10;&#10;*{{make}} {{model}} {{year}}*&#10;מחיר: {{price}}&#10;..."
            />
          </div>
          <div className="col-span-4">
            <p className="text-sm text-muted-foreground mb-2">תגיות זמינות:</p>
            <div className="flex flex-wrap gap-2">
              {templateTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onTemplateChange({
                      ...newTemplate,
                      template: newTemplate.template + tag
                    });
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setIsOpen(false);
          }}>
            ביטול
          </Button>
          <Button type="submit" onClick={onSave}>
            {isNew ? 'שמור תבנית' : 'עדכן תבנית'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
