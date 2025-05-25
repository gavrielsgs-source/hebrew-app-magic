
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { useToast } from "@/hooks/use-toast";
import {
  WhatsappTemplate,
  templates as defaultWhatsappTemplates,
} from "@/components/whatsapp/whatsapp-templates";
import { useEffect, useState } from "react";

const templateFormSchema = {
  name: (value: string) => value.length >= 2 ? null : "שם התבנית חייב להיות לפחות 2 תווים.",
  template: (value: string) => value.length >= 10 ? null : "התבנית חייבת להכיל לפחות 10 תווים.",
};

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
    "{{kilometers}}",
    "{{color}}",
    "{{engine}}",
    "{{transmission}}",
    "{{fuel}}",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <TemplateHeader
          onNewTemplate={onNewTemplate}
          onResetDefaults={onResetDefaults}
        />

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md mx-auto">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין תבניות</h3>
              <p className="text-muted-foreground mb-4">
                התחל בצרת התבנית הראשונה שלך לשליחת הודעות ללקוחות
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={onEditTemplate}
                onDelete={onDeleteTemplate}
              />
            ))}
          </div>
        )}

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
