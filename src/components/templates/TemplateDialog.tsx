
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Sparkles, Car, User, AlertCircle } from "lucide-react";
import { UnifiedTemplate } from "@/components/whatsapp/lead-templates";

interface TemplateDialogProps {
  isOpen: boolean;
  isNew: boolean;
  newTemplate: UnifiedTemplate;
  setIsOpen: (open: boolean) => void;
  onSave: () => void;
  onTemplateChange: (template: UnifiedTemplate) => void;
  templateTags: string[];
}

// Mock data for preview
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

const mockLeadName = "יואב כהן";
const mockLeadSource = "פייסבוק";

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
  const isMobile = useIsMobile();
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
        if (newTemplate.type === 'car') {
          setTemplateContent(newTemplate.generateMessage(mockCar));
        } else {
          setTemplateContent(newTemplate.generateMessage(mockLeadName, mockLeadSource));
        }
      }
    }
  }, [newTemplate]);

  const handleTemplateContentChange = (content: string) => {
    setTemplateContent(content);
    // Create a new generateMessage function based on template type
    if (newTemplate.type === 'car') {
      onTemplateChange({
        ...newTemplate,
        generateMessage: (car: any) => {
          // Simple template variable replacement for cars
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
        },
        templateContent: content // Store the template content for editing
      });
    } else {
      onTemplateChange({
        ...newTemplate,
        generateMessage: (leadName: string, leadSource?: string) => {
          // Simple template variable replacement for leads
          return content
            .replace(/\$\{leadName\}/g, leadName || '')
            .replace(/\$\{leadSource\s*\?\s*`[^`]*\$\{leadSource\}[^`]*`\s*:\s*'[^']*'\}/g, 
                     leadSource ? `בעקבות הפנייה שלך ב${leadSource}` : 'מהצוות שלנו');
        },
        templateContent: content // Store the template content for editing
      });
    }
  };

  const handleTypeChange = (newType: 'car' | 'lead') => {
    // When changing type, update template content and provide default content
    const defaultContent = newType === 'car' 
      ? `שלום,

רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:

*\${car.make} \${car.model} \${car.year}*
מחיר: \${car.price ? \`₪\${car.price.toLocaleString()}\` : 'בהתאם להצעה'}
ק"מ: \${car.mileage ? \`\${car.mileage.toLocaleString()} ק"מ\` : 'לא צוין'}
צבע: \${car.exterior_color || 'לא צוין'}

נשמח לתאם פגישה לצפייה ברכב.

בברכה,
צוות המכירות`
      : `היי \${leadName}! 👋

קיבלנו את הפנייה שלך\${leadSource ? \` דרך \${leadSource}\` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`;

    setTemplateContent(defaultContent);
    
    onTemplateChange({
      ...newTemplate,
      type: newType,
      templateContent: defaultContent,
      generateMessage: newType === 'car' 
        ? (car: any) => defaultContent
            .replace(/\$\{car\.make\}/g, car.make || '')
            .replace(/\$\{car\.model\}/g, car.model || '')
            .replace(/\$\{car\.year\}/g, car.year || '')
            .replace(/\$\{car\.price\s*\?\s*`₪\$\{car\.price\.toLocaleString\(\)\}`\s*:\s*'[^']*'\}/g, 
                     car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה')
            .replace(/\$\{car\.mileage\s*\?\s*`\$\{car\.mileage\.toLocaleString\(\)\}\s*ק"מ`\s*:\s*'[^']*'\}/g,
                     car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין')
            .replace(/\$\{car\.exterior_color\s*\|\|\s*'[^']*'\}/g, car.exterior_color || 'לא צוין')
        : (leadName: string, leadSource?: string) => defaultContent
            .replace(/\$\{leadName\}/g, leadName || '')
            .replace(/\$\{leadSource\s*\?\s*`[^`]*\$\{leadSource\}[^`]*`\s*:\s*'[^']*'\}/g, 
                     leadSource ? `בעקבות הפנייה שלך ב${leadSource}` : 'מהצוות שלנו')
    });
  };

  const handleSave = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast({
        title: "יש למלא את כל השדות",
        description: "יש לוודא ששם התבנית והתיאור שלה מלאים.",
        variant: "destructive",
      });
      return;
    }

    if (!templateContent.trim()) {
      toast({
        title: "יש למלא את תוכן התבנית",
        description: "אנא הכנס את תוכן התבנית.",
        variant: "destructive",
      });
      return;
    }

    onSave();
    toast({
      title: isNew ? "התבנית נוצרה בהצלחה" : "התבנית עודכנה בהצלחה",
      description: `התבנית "${newTemplate.name}" ${isNew ? 'נוצרה' : 'עודכנה'} בהצלחה וזמינה לשימוש.`,
    });
  };

  // Filter template tags based on type
  const relevantTags = templateTags.filter(tag => {
    if (newTemplate.type === 'car') {
      return tag.includes('car.');
    } else {
      return tag.includes('leadName') || tag.includes('leadSource');
    }
  });

  return (
    <SwipeDialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className={`${isMobile ? 'w-[95%] h-[95vh]' : 'sm:max-w-[700px]'} max-h-[95vh] overflow-y-auto`} 
        dir="rtl"
      >
        <DialogHeader className="text-right">
          <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} flex items-center justify-end gap-2`}>
            {isNew ? 'תבנית חדשה' : 'עריכת תבנית'}
            <Badge variant={newTemplate.type === 'car' ? 'default' : 'secondary'} className="text-xs">
              {newTemplate.type === 'car' ? (
                <>
                  <Car className="h-3 w-3 mr-1" />
                  רכב
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" />
                  לקוח
                </>
              )}
            </Badge>
            <Sparkles className="h-6 w-6 text-carslead-purple" />
          </DialogTitle>
          <DialogDescription className={`text-right ${isMobile ? 'text-sm' : 'text-base'}`}>
            {newTemplate.type === 'car' ? (
              <>צור תבנית מותאמת אישית לשליחת הודעות רכבים. השתמש במשתנים כמו {"{"}car.make{"}"}, {"{"}car.model{"}"} וכו' כדי לכלול פרטים דינמיים מהרכב.</>
            ) : (
              <>צור תבנית מותאמת אישית לשליחת הודעות ללקוחות. השתמש במשתנים כמו {"{"}leadName{"}"}, {"{"}leadSource{"}"} וכו' כדי לכלול פרטים דינמיים מהלקוח.</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`grid gap-4 py-4 ${isMobile ? 'gap-3' : 'gap-6'}`}>
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
            <Label htmlFor="type" className="text-right text-sm font-medium flex items-center gap-2">
              סוג התבנית
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </Label>
            <Select
              value={newTemplate.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="בחר סוג תבנית" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="car">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <div className="text-right">
                      <div className="font-medium">תבנית רכב</div>
                      <div className="text-xs text-gray-500">לשליחת פרטי רכבים ללקוחות</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="lead">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div className="text-right">
                      <div className="font-medium">תבנית לקוח</div>
                      <div className="text-xs text-gray-500">ליצירת קשר כללית עם לקוחות</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 text-right">
              שינוי סוג התבנית יאפס את התוכן למבנה המתאים
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template" className="text-right text-sm font-medium">
              תוכן התבנית
            </Label>
            <Textarea
              id="template"
              value={templateContent}
              onChange={(e) => handleTemplateContentChange(e.target.value)}
              className={`text-right font-mono text-sm leading-relaxed ${
                isMobile ? 'min-h-[150px]' : 'min-h-[200px]'
              }`}
              placeholder={newTemplate.type === 'car' ? 
                "שלום,\n\nרצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:\n\n*${car.make} ${car.model} ${car.year}*\nמחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}\n..." :
                "שלום ${leadName},\n\n[ערוך כאן את ההודעה שלך]\n\nבברכה,\nצוות המכירות"
              }
              dir="rtl"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm font-medium">תגיות זמינות עבור {newTemplate.type === 'car' ? 'רכבים' : 'לקוחות'}:</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`flex flex-wrap gap-2 justify-end ${isMobile ? 'max-h-20 overflow-y-auto' : ''}`}>
              {relevantTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`cursor-pointer hover:bg-carslead-purple hover:text-white transition-colors ${
                    isMobile ? 'text-xs px-2 py-1' : ''
                  }`}
                  onClick={() => {
                    if (newTemplate.type === 'car') {
                      const carVar = tag.replace(/{{|}}/g, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                      const templateVar = `\${car.${carVar}}`;
                      handleTemplateContentChange(templateContent + templateVar);
                    } else {
                      const leadVar = tag.replace(/{{|}}/g, '');
                      const templateVar = `\${${leadVar}}`;
                      handleTemplateContentChange(templateContent + templateVar);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <p className={`text-muted-foreground text-right ${isMobile ? 'text-xs' : 'text-xs'}`}>
              לחץ על תגית כדי להוסיף אותה לתבנית
            </p>
          </div>
        </div>
        
        <DialogFooter className={`gap-2 ${isMobile ? 'flex-col-reverse' : ''}`}>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className={`${isMobile ? 'w-full order-2' : ''} px-6`}
          >
            ביטול
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave}
            className={`${isMobile ? 'w-full order-1' : ''} bg-carslead-purple hover:bg-carslead-purple/90 px-6`}
          >
            {isNew ? 'שמור תבנית' : 'עדכן תבנית'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </SwipeDialog>
  );
}
