import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  WhatsappTemplate,
  templates as defaultWhatsappTemplates,
} from "@/components/whatsapp/whatsapp-templates";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const templateFormSchema = z.object({
  name: z.string().min(2, {
    message: "שם התבנית חייב להיות לפחות 2 תווים.",
  }),
  template: z.string().min(10, {
    message: "התבנית חייבת להכיל לפחות 10 תווים.",
  }),
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate>(
    defaultWhatsappTemplates[0]
  );
  const { toast } = useToast();

  const templateTags = [
    "{{make}}",
    "{{model}}",
    "{{year}}",
    "{{price}}",
    "{{name}}",
  ];

  useEffect(() => {
    // Load templates from local storage on component mount
    const storedTemplates = localStorage.getItem("whatsappTemplates");
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      // If no templates in local storage, use the default templates
      setTemplates(defaultWhatsappTemplates);
    }
  }, []);

  useEffect(() => {
    // Save templates to local storage whenever the templates state changes
    localStorage.setItem("whatsappTemplates", JSON.stringify(templates));
  }, [templates]);

  const onNewTemplate = () => {
    setIsNewTemplate(true);
    setSelectedTemplate({
      id: Date.now().toString(),
      name: "",
      template: "",
    });
    setIsDialogOpen(true);
  };

  const onEditTemplate = (template: WhatsappTemplate) => {
    setIsNewTemplate(false);
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const onTemplateChange = (template: WhatsappTemplate) => {
    setSelectedTemplate(template);
  };

  const onSaveTemplate = () => {
    if (!selectedTemplate.name || !selectedTemplate.template) {
      toast({
        title: "יש למלא את כל השדות",
        description: "יש לוודא ששם התבנית והתוכן שלה מלאים.",
        variant: "destructive",
      });
      return;
    }

    if (isNewTemplate) {
      setTemplates([...templates, selectedTemplate]);
      toast({
        title: "תבנית חדשה נוספה",
        description: "התבנית החדשה נוספה בהצלחה לרשימה.",
      });
    } else {
      const updatedTemplates = templates.map((t) =>
        t.id === selectedTemplate.id ? selectedTemplate : t
      );
      setTemplates(updatedTemplates);
      toast({
        title: "התבנית עודכנה",
        description: "התבנית נשמרה בהצלחה.",
      });
    }

    setIsDialogOpen(false);
  };

  const onDeleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== id);
    setTemplates(updatedTemplates);
    toast({
      title: "התבנית נמחקה",
      description: "התבנית נמחקה בהצלחה.",
    });
  };

  const onResetDefaults = () => {
    setTemplates([...defaultWhatsappTemplates]);
    toast({
      title: "תבניות ברירת מחדל שוחזרו",
      description: "תבניות ברירת המחדל שוחזרו בהצלחה.",
    });
  };

  return (
    <div className="p-4" dir="rtl">
      <div className="text-right">
        <TemplateHeader
          onNewTemplate={onNewTemplate}
          onResetDefaults={onResetDefaults}
        />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={onEditTemplate}
              onDelete={onDeleteTemplate}
            />
          ))}
        </div>

        <TemplateDialog
          isOpen={isDialogOpen}
          isNew={isNewTemplate}
          newTemplate={selectedTemplate}
          setIsOpen={setIsDialogOpen}
          onSave={onSaveTemplate}
          onTemplateChange={onTemplateChange}
          templateTags={templateTags}
        />
      </div>
    </div>
  );
}
