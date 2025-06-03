
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { FileText, Edit, Trash2, Eye, Car, User } from "lucide-react";
import { UnifiedTemplate } from "@/components/whatsapp/lead-templates";
import { Badge } from "@/components/ui/badge";

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
  const previewMessage = template.type === 'car' 
    ? template.generateMessage(mockCar)
    : template.generateMessage(mockLeadName, mockLeadSource);
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between w-full">
          {/* כותרת ותיאור - צד ימין */}
          <div className="text-right order-2 flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 justify-end">
              <Badge variant={template.type === 'car' ? 'default' : 'secondary'} className="text-xs">
                {template.type === 'car' ? (
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
              <FileText className="h-4 w-4 text-muted-foreground" />
              {template.name}
            </CardTitle>
            <CardDescription className="mt-1 text-right">
              {template.description}
            </CardDescription>
          </div>
          
          {/* כפתורי פעולה - צד שמאל */}
          <div className="flex gap-1 order-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(template)}
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(template.id)}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="bg-muted/30 rounded-lg p-3 min-h-[100px] max-h-[120px] overflow-hidden">
          <div className="text-sm text-muted-foreground whitespace-pre-line text-right line-clamp-4">
            {previewMessage}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 justify-start">
        <SwipeDialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
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
