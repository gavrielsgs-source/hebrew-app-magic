
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
  // Generate preview message based on template type
  const generatePreviewMessage = () => {
    try {
      // First try to use the template's generateMessage function directly
      if (template.generateMessage && typeof template.generateMessage === 'function') {
        if (template.type === 'car') {
          return template.generateMessage(mockCar);
        } else if (template.type === 'lead') {
          return template.generateMessage(mockLeadName, mockLeadSource);
        }
      }

      // Fallback: Try to find in default templates
      const allDefaultTemplates = [...whatsappTemplates, ...whatsappLeadTemplates];
      const originalTemplate = allDefaultTemplates.find(t => t.id === template.id);
      
      if (originalTemplate && typeof originalTemplate.generateMessage === 'function') {
        if (originalTemplate.type === 'car') {
          return originalTemplate.generateMessage(mockCar);
        } else if (originalTemplate.type === 'lead') {
          return originalTemplate.generateMessage(mockLeadName, mockLeadSource);
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(template)}
              className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-transparent hover:border-blue-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(template.id)}
              className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-6">
        <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] max-h-[120px] overflow-hidden border border-gray-100">
          <div className="text-sm text-gray-700 whitespace-pre-line text-right line-clamp-4 leading-relaxed">
            {previewMessage}
          </div>
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
