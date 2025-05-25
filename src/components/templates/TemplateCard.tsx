
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { FileText, Edit, Trash2, Eye } from "lucide-react";

interface TemplateCardProps {
  template: WhatsappTemplate;
  onEdit: (template: WhatsappTemplate) => void;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between w-full">
          {/* כפתורי פעולה - צד שמאל */}
          <div className="flex gap-1">
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
          
          {/* כותרת ותיאור - צד ימין */}
          <div className="text-right">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 justify-end">
              {template.name}
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription className="mt-1 text-right">
              תבנית הודעת וואטסאפ
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="bg-muted/30 rounded-lg p-3 min-h-[100px] max-h-[120px] overflow-hidden">
          <div className="text-sm text-muted-foreground whitespace-pre-line text-right line-clamp-4">
            {template.template}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 justify-start">
        <Dialog>
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
              <WhatsappTemplatePreview template={template.template} />
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
