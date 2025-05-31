import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  WhatsappTemplate,
  whatsappTemplates as defaultWhatsappTemplates,
} from "@/components/whatsapp/whatsapp-templates";
import { useEffect, useState } from "react";

// Template storage interface for localStorage
interface StoredTemplate {
  id: string;
  name: string;
  description: string;
  templateContent: string; // Store the template content instead of function
}

const templateFormSchema = {
  name: (value: string) => value.length >= 2 ? null : "שם התבנית חייב להיות לפחות 2 תווים.",
  description: (value: string) => value.length >= 10 ? null : "התיאור חייב להכיל לפחות 10 תווים.",
};

// Helper function to create generateMessage function from template content
const createGenerateMessageFunction = (templateContent: string) => {
  return (car: any) => {
    return templateContent
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
  };
};

// Helper function to extract template content from generateMessage function
const extractTemplateContent = (template: WhatsappTemplate): string => {
  // Try to extract the template from the function if it's a simple return
  const funcString = template.generateMessage.toString();
  const match = funcString.match(/return\s*`([^`]*)`/);
  if (match) {
    return match[1];
  }
  
  // Fallback: generate with mock data and try to reverse-engineer
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
  
  return template.generateMessage(mockCar);
};

// Convert stored template to full template with function
const storedToFullTemplate = (stored: StoredTemplate): WhatsappTemplate => ({
  id: stored.id,
  name: stored.name,
  description: stored.description,
  generateMessage: createGenerateMessageFunction(stored.templateContent)
});

// Convert full template to stored template
const fullToStoredTemplate = (template: WhatsappTemplate): StoredTemplate => ({
  id: template.id,
  name: template.name,
  description: template.description,
  templateContent: extractTemplateContent(template)
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate>(
    defaultWhatsappTemplates[0]
  );
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      try {
        const parsedStored: StoredTemplate[] = JSON.parse(storedTemplates);
        const fullTemplates = parsedStored.map(storedToFullTemplate);
        setTemplates(fullTemplates);
      } catch (error) {
        console.error("Error loading templates from localStorage:", error);
        // If parsing fails, use default templates
        setTemplates(defaultWhatsappTemplates);
      }
    } else {
      // If no templates in local storage, use the default templates
      setTemplates(defaultWhatsappTemplates);
    }
  }, []);

  useEffect(() => {
    // Save templates to local storage whenever the templates state changes
    try {
      const storedTemplates = templates.map(fullToStoredTemplate);
      localStorage.setItem("whatsappTemplates", JSON.stringify(storedTemplates));
    } catch (error) {
      console.error("Error saving templates to localStorage:", error);
    }
  }, [templates]);

  const onNewTemplate = () => {
    setIsNewTemplate(true);
    setSelectedTemplate({
      id: Date.now().toString(),
      name: "",
      description: "",
      generateMessage: () => "",
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
    if (!selectedTemplate.name || !selectedTemplate.description) {
      toast({
        title: "יש למלא את כל השדות",
        description: "יש לוודא ששם התבנית והתיאור שלה מלאים.",
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isMobile ? 'pb-24' : ''}`} dir="rtl">
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'px-2 py-4' : ''}`}>
        <TemplateHeader
          onNewTemplate={onNewTemplate}
          onResetDefaults={onResetDefaults}
        />

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className={`bg-white rounded-lg shadow-sm border p-8 max-w-md mx-auto ${isMobile ? 'p-6' : ''}`}>
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>אין תבניות</h3>
              <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-sm' : ''}`}>
                התחל בצרת התבנית הראשונה שלך לשליחת הודעות ללקוחות
              </p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            isMobile 
              ? 'grid-cols-1' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
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
