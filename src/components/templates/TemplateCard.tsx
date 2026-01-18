import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { FileText, Edit, Trash2, Eye, Car, User, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Template interface matching database structure
interface DbTemplate {
  id: string;
  name: string;
  description: string;
  type: 'car' | 'lead';
  template_content?: string;
  templateContent?: string;
  is_default?: boolean;
  facebook_template_name?: string;
}

interface TemplateCardProps {
  template: DbTemplate;
  onEdit: (template: DbTemplate) => void;
  onDelete: (id: string) => void;
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

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const [previewCta, setPreviewCta] = useState("לקבוע פגישה");
  const [customPreviewCta, setCustomPreviewCta] = useState("");
  
  // Check if this is a default (system) template - use is_default from DB
  const isDefaultTemplate = (template as any).is_default === true;
  
  // Get current CTA
  const getCurrentCta = () => {
    return previewCta === "custom" ? customPreviewCta : previewCta;
  };
  
  // Generate preview message based on template type - uses template_content from DB
  const generatePreviewMessage = () => {
    try {
      // Get template content from database (mapped to templateContent or original template_content)
      const content = (template as any).templateContent || (template as any).template_content || '';
      
      if (!content.trim()) {
        return "תצוגה מקדימה של ההודעה תופיע כאן";
      }

      let preview = content;
      const currentCta = getCurrentCta();
      const carName = `${mockCar.make} ${mockCar.model} ${mockCar.year}`;
      
      if (template.type === 'car') {
        // Replace car template placeholders - both numbered and named
        preview = preview
          // Named placeholders
          .replace(/\{\{carName\}\}/g, carName)
          .replace(/\{\{price\}\}/g, `₪${mockCar.price.toLocaleString()}`)
          .replace(/\{\{mileage\}\}/g, `${mockCar.mileage.toLocaleString()} ק"מ`)
          .replace(/\{\{kilometers\}\}/g, `${mockCar.mileage.toLocaleString()} ק"מ`)
          .replace(/\{\{color\}\}/g, mockCar.exterior_color)
          .replace(/\{\{engine\}\}/g, mockCar.engine_size)
          .replace(/\{\{transmission\}\}/g, mockCar.transmission)
          .replace(/\{\{fuel\}\}/g, mockCar.fuel_type)
          .replace(/\{\{CTA\}\}/g, currentCta)
          // Numbered placeholders (for Facebook-approved templates)
          .replace(/\{\{1\}\}/g, carName)
          .replace(/\{\{2\}\}/g, mockCar.price.toLocaleString())
          .replace(/\{\{3\}\}/g, mockCar.fuel_type)
          .replace(/\{\{4\}\}/g, mockCar.mileage.toLocaleString())
          .replace(/\{\{5\}\}/g, mockCar.transmission)
          .replace(/\{\{6\}\}/g, "054-1234567")
          .replace(/\{\{7\}\}/g, currentCta);
      } else if (template.type === 'lead') {
        // Replace lead template placeholders
        preview = preview
          .replace(/\{\{leadName\}\}/g, mockLeadName)
          .replace(/\{\{customerName\}\}/g, mockLeadName)
          .replace(/\{\{name\}\}/g, mockLeadName)
          .replace(/\{\{leadSource\}\}/g, ` דרך ${mockLeadSource}`)
          .replace(/\{\{carDetails\}\}/g, ` ${carName}`)
          .replace(/\{\{CTA\}\}/g, currentCta);
      }
      
      return preview;
    } catch (error) {
      console.error("Error generating preview message:", error);
      return "שגיאה ביצירת תצוגה מקדימה";
    }
  };

  const previewMessage = generatePreviewMessage();
  
  return (
    <Card className={`hover:shadow-xl transition-all duration-300 border rounded-2xl overflow-hidden ${
      isDefaultTemplate 
        ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' 
        : 'border-gray-200 bg-white dark:bg-card'
    }`}>
      <CardHeader className="pb-4 p-6">
        <div className="flex items-start justify-between w-full" dir="rtl">
          {/* כותרת ותיאור - צד ימין */}
          <div className="text-right flex-1">
            <CardTitle className="text-lg font-bold flex items-center gap-3 justify-end mb-2 flex-wrap">
              {isDefaultTemplate && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary border-primary/30"
                >
                  ברירת מחדל
                </Badge>
              )}
              <Badge 
                variant={template.type === 'car' ? 'default' : 'secondary'} 
                className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 ${
                  template.type === 'car' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                {template.type === 'car' ? (
                  <>
                    <Car className="h-3 w-3 ml-1" />
                    רכב
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 ml-1" />
                    לקוח
                  </>
                )}
              </Badge>
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="text-gray-800 dark:text-gray-100">{template.name}</span>
            </CardTitle>
            <CardDescription className="text-right text-gray-600 leading-relaxed">
              {template.description}
            </CardDescription>
          </div>
          
          {/* כפתורי פעולה - צד שמאל */}
          <div className="flex gap-2">
            {isDefaultTemplate ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(template)}
                      className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-transparent hover:border-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>צפה בתבנית</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(template)}
                        className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-transparent hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ערוך תבנית</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(template.id)}
                        className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>מחק תבנית</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-6 space-y-3">
        {/* Warning for non-default templates */}
        {!isDefaultTemplate && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-right text-xs" dir="rtl">
              תבנית זו אינה מאושרת על ידי WhatsApp Business. ניתן לשלוח רק אם הלקוח ענה לבוט ב-24 השעות האחרונות.
            </AlertDescription>
          </Alert>
        )}
        <div className="bg-muted/50 p-4 rounded-xl border max-h-[150px] overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap text-right font-sans" dir="rtl">
            {previewMessage}
          </pre>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-6 px-6 justify-start">
        <SwipeDialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                // Reset CTA when opening preview
                setPreviewCta("לקבוע פגישה");
                setCustomPreviewCta("");
              }}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-200 hover:border-[#2F3C7E] hover:text-[#2F3C7E] transition-all duration-200 px-4 py-2 font-medium"
            >
              <Eye className="h-4 w-4" />
              תצוגה מקדימה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">תצוגה מקדימה - {template.name}</DialogTitle>
            </DialogHeader>
            
            {/* CTA Selector in Preview */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="preview-cta">קריאה לפעולה (CTA) לתצוגה מקדימה</Label>
              <Select value={previewCta} onValueChange={setPreviewCta}>
                <SelectTrigger id="preview-cta" className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 text-right">
                  <SelectValue placeholder="בחר קריאה לפעולה" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-primary/20 z-[100]">
                  <SelectItem value="לקבוע פגישה">לקבוע פגישה</SelectItem>
                  <SelectItem value="לתאם צפייה">לתאם צפייה</SelectItem>
                  <SelectItem value="לקבוע שיחה קצרה">לקבוע שיחה קצרה</SelectItem>
                  <SelectItem value="להתייעץ">להתייעץ</SelectItem>
                  <SelectItem value="לקבל הצעת מחיר">לקבל הצעת מחיר</SelectItem>
                  <SelectItem value="custom">טקסט מותאם אישית</SelectItem>
                </SelectContent>
              </Select>
              {previewCta === "custom" && (
                <Input
                  placeholder="הזן קריאה לפעולה מותאמת אישית"
                  value={customPreviewCta}
                  onChange={(e) => setCustomPreviewCta(e.target.value)}
                  className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
                />
              )}
            </div>
            
            <div className="mt-4">
              <WhatsappTemplatePreview template={previewMessage} />
            </div>
          </DialogContent>
        </SwipeDialog>
      </CardFooter>
    </Card>
  );
}
