
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

// Mock car data for preview
const mockCar = {
  make: "טויוטה",
  model: "קורולה", 
  year: 2022,
  price: 120000,
  mileage: 25000,
  exterior_color: "כסוף",
  engine_size: "1.6L",
  transmission: "אוטומטית",
  fuel_type: "בנזין"
};

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

  const [templateContent, setTemplateContent] = useState("");

  // Get the template content from generateMessage for editing
  React.useEffect(() => {
    if (newTemplate.generateMessage) {
      // Try to extract the template from the function if it's a simple return
      const funcString = newTemplate.generateMessage.toString();
      const match = funcString.match(/return\s*`([^`]*)`/);
      if (match) {
        setTemplateContent(match[1]);
      } else {
        // Fallback: generate with mock data
        setTemplateContent(newTemplate.generateMessage(mockCar));
      }
    }
  }, [newTemplate]);

  const handleTemplateContentChange = (content: string) => {
    setTemplateContent(content);
    // Create a new generateMessage function
    onTemplateChange({
      ...newTemplate,
      generateMessage: (car: any) => {
        // Simple template variable replacement
        return content
          .replace(/\$\{car\.make\}/g, car.make || '')
          .replace(/\$\{car\.model\}/g, car.model || '')
          .replace(/\$\{car\.year\}/g, car.year || '')
          .replace(/\$\{car\.price\s*\?\s*`₪\$\{car\.price\.toLocaleString\(\)\}`\s*:\s*'[^']*'\}/g, 
                   car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה')
          .replace(/\$\{car\.mileage\s*\?\s*`\$\{car\.mileage\.toLocaleString\(\)\}\s*ק"מ`\s*:\s*'[^']*'\}/g,
                   car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין')
          .replace(/\$\{car\.exterior_color\s*\|\|\s*'[^']*'\}/g, car.exterior_color || 'לא צוין')
          .replace(/\$\{car\.engine_size\s*\|\|\s*'[^']*'\}/g, car.engine_size || 'לא צוין')
          .replace(/\$\{car\.transmission\s*\|\|\s*'[^']*'\}/g, car.transmission || 'לא צוין')
          .replace(/\$\{car\.fuel_type\s*\|\|\s*'[^']*'\}/g, car.fuel_type || 'לא צוין');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl flex items-center justify-end gap-2">
            {isNew ? 'תבנית חדשה' : 'עריכת תבנית'}
            <Sparkles className="h-6 w-6 text-carslead-purple" />
          </DialogTitle>
          <DialogDescription className="text-right text-base">
            צור תבנית מותאמת אישית לשליחת הודעות. השתמש במשתנים כמו {"{"}car.make{"}"}, {"{"}car.model{"}"} וכו' כדי לכלול פרטים דינמיים מהרכב.
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
            <Label htmlFor="description" className="text-right text-sm font-medium">
              תיאור התבנית
            </Label>
            <Input
              id="description"
              value={newTemplate.description}
              onChange={(e) => onTemplateChange({ ...newTemplate, description: e.target.value })}
              placeholder="לדוגמה: הודעה לתיאום פגישה עם הלקוח"
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
              value={templateContent}
              onChange={(e) => handleTemplateContentChange(e.target.value)}
              className="min-h-[200px] text-right font-mono text-sm leading-relaxed"
              placeholder="שלום,&#10;&#10;רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:&#10;&#10;*${car.make} ${car.model} ${car.year}*&#10;מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}&#10;..."
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
                    const carVar = tag.replace(/{{|}}/g, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                    const templateVar = `\${car.${carVar}}`;
                    handleTemplateContentChange(templateContent + templateVar);
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
