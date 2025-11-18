
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { FileText, Edit, Trash2, Eye, Car, User } from "lucide-react";
import { UnifiedTemplate } from "@/components/whatsapp/lead-templates";
import { Badge } from "@/components/ui/badge";
import { whatsappTemplates } from "@/components/whatsapp/whatsapp-templates";
import { whatsappLeadTemplates } from "@/components/whatsapp/lead-templates";
import { whatsappCustomerTemplates } from "@/components/whatsapp/customer-templates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TemplateCardProps {
  template: UnifiedTemplate;
  onEdit: (template: UnifiedTemplate) => void;
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
  // Check if this is a default (system) template
  const allDefaultTemplates = [...whatsappTemplates, ...whatsappLeadTemplates, ...whatsappCustomerTemplates];
  const isDefaultTemplate = allDefaultTemplates.some(t => t.id === template.id);
  
  // Generate preview message based on template type
  const generatePreviewMessage = () => {
    try {
      // FIRST: Try to find in default templates and use generateMessage
      const allDefaultTemplates = [...whatsappTemplates, ...whatsappLeadTemplates, ...whatsappCustomerTemplates];
      const originalTemplate = allDefaultTemplates.find(t => t.id === template.id);
      
      if (originalTemplate && typeof originalTemplate.generateMessage === 'function') {
        if (originalTemplate.type === 'car') {
          return originalTemplate.generateMessage(mockCar, 'לקבוע פגישה');
        } else if (originalTemplate.type === 'lead') {
          return originalTemplate.generateMessage(mockLeadName, mockLeadSource, 'לקבוע שיחה');
        } else if ((originalTemplate as any).type === 'customer') {
          return (originalTemplate as any).generateMessage(mockLeadName, `${mockCar.make} ${mockCar.model} ${mockCar.year}`, 'לקבוע שיחה');
        }
      }

      // SECOND: Try to use the template's generateMessage function directly
      if (template.generateMessage && typeof template.generateMessage === 'function') {
        if (template.type === 'car') {
          return template.generateMessage(mockCar, 'לקבוע פגישה');
        } else if (template.type === 'lead') {
          return template.generateMessage(mockLeadName, mockLeadSource, 'לקבוע שיחה');
        } else if (template.type === 'customer') {
          return template.generateMessage(mockLeadName, `${mockCar.make} ${mockCar.model} ${mockCar.year}`, 'לקבוע שיחה');
        }
      }

      // THIRD: If template has templateContent with placeholders, replace them
      if ((template as any).templateContent && (template as any).templateContent.trim()) {
        let preview = (template as any).templateContent;
        
        if (template.type === 'car') {
          // Replace numbered placeholders ({{1}}, {{2}}, etc.)
          preview = preview
            .replace(/\{\{1\}\}/g, mockCar.make)
            .replace(/\{\{2\}\}/g, mockCar.model)
            .replace(/\{\{3\}\}/g, mockCar.year.toString())
            .replace(/\{\{4\}\}/g, `₪${mockCar.price.toLocaleString()}`)
            .replace(/\{\{5\}\}/g, `${mockCar.mileage.toLocaleString()} ק"מ`)
            .replace(/\{\{6\}\}/g, mockCar.exterior_color)
            .replace(/\{\{7\}\}/g, mockCar.engine_size)
            .replace(/\{\{8\}\}/g, mockCar.transmission)
            .replace(/\{\{9\}\}/g, mockCar.fuel_type)
            .replace(/\{\{CTA\}\}/g, 'לקבוע פגישה')
            .replace(/\{\{10\}\}/g, 'לקבוע פגישה');
          return preview;
        } else if (template.type === 'lead') {
          // Replace lead placeholders
          preview = preview
            .replace(/\{\{leadName\}\}/g, mockLeadName)
            .replace(/\{\{leadSource\}\}/g, ` דרך ${mockLeadSource}`)
            .replace(/\{\{carDetails\}\}/g, ` ${mockCar.make} ${mockCar.model} ${mockCar.year}`)
            .replace(/\{\{CTA\}\}/g, 'לקבוע שיחה');
          return preview;
        } else if (template.type === 'customer') {
          // Replace customer placeholders
          preview = preview
            .replace(/\{\{customerName\}\}/g, mockLeadName)
            .replace(/\{\{carDetails\}\}/g, `${mockCar.make} ${mockCar.model} ${mockCar.year}`)
            .replace(/\{\{CTA\}\}/g, 'לקבוע שיחה');
          return preview;
        }
      }
      
      // Final fallback
      return "תצוגה מקדימה של ההודעה תופיע כאן";
      
    } catch (error) {
      console.error("Error generating preview message:", error);
      return "שגיאה ביצירת תצוגה מקדימה";
    }
  };

  const previewMessage = generatePreviewMessage();
  
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 p-6">
        <div className="flex items-start justify-between w-full">
          {/* כותרת ותיאור - צד שמאל */}
          <div className="text-left order-1 flex-1">
            <CardTitle className="text-lg font-bold flex items-center gap-3 justify-start mb-2">
              <span className="text-gray-800">{template.name}</span>
              <FileText className="h-5 w-5 text-gray-400" />
              <Badge 
                variant={template.type === 'car' ? 'default' : 'secondary'} 
                className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 ${
                  template.type === 'car' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {template.type === 'car' ? (
                  <>
                    רכב
                    <Car className="h-3 w-3 mr-1" />
                  </>
                ) : (
                  <>
                    לקוח
                    <User className="h-3 w-3 mr-1" />
                  </>
                )}
              </Badge>
            </CardTitle>
            <CardDescription className="text-left text-gray-600 leading-relaxed">
              {template.description}
            </CardDescription>
          </div>
          
          {/* כפתורי פעולה - צד ימין */}
          <div className="flex gap-2 order-2">
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
      
      <CardContent className="pt-0 px-6">
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
            <div className="mt-4">
              <WhatsappTemplatePreview template={previewMessage} />
            </div>
          </DialogContent>
        </SwipeDialog>
      </CardFooter>
    </Card>
  );
}
