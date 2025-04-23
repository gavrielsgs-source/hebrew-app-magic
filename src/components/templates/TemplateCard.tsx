
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { FileText, Edit, Trash2 } from "lucide-react";

interface TemplateCardProps {
  template: WhatsappTemplate;
  onEdit: (template: WhatsappTemplate) => void;
  onDelete: (id: string) => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  return (
    <Card key={template.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{template.name}</span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(template)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(template.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 ml-1" /> תבנית וואטסאפ
        </CardDescription>
      </CardHeader>
      <CardContent className="h-28 overflow-y-auto">
        <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
          {template.template}
        </div>
      </CardContent>
      <CardFooter className="justify-start">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">הצג תצוגה מקדימה</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>תצוגה מקדימה - {template.name}</DialogTitle>
            </DialogHeader>
            <WhatsappTemplatePreview template={template.template} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
