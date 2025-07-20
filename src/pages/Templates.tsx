
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { whatsappTemplates, WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { whatsappLeadTemplates, WhatsappLeadTemplate, UnifiedTemplate } from "@/components/whatsapp/lead-templates";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";

export default function Templates() {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<UnifiedTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState<UnifiedTemplate>({
    id: '',
    name: '',
    description: '',
    type: 'car',
    generateMessage: () => ''
  });
  const isMobile = useIsMobile();

  // Combine all default templates
  const allDefaultTemplates: UnifiedTemplate[] = [
    ...whatsappTemplates,
    ...whatsappLeadTemplates
  ];

  useEffect(() => {
    const savedTemplates = localStorage.getItem('whatsapp-templates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      // Always load default templates if saved templates are empty or don't exist
      if (!parsed || parsed.length === 0) {
        setTemplates(allDefaultTemplates);
        localStorage.setItem('whatsapp-templates', JSON.stringify(allDefaultTemplates));
      } else {
        setTemplates(parsed);
      }
    } else {
      // No saved templates, load defaults
      setTemplates(allDefaultTemplates);
      localStorage.setItem('whatsapp-templates', JSON.stringify(allDefaultTemplates));
    }
  }, []);

  const saveTemplates = (newTemplates: UnifiedTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('whatsapp-templates', JSON.stringify(newTemplates));
  };

  const addTemplate = (template: Omit<UnifiedTemplate, 'id'>) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString()
    };
    saveTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (updatedTemplate: UnifiedTemplate) => {
    const newTemplates = templates.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    );
    saveTemplates(newTemplates);
  };

  const deleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(newTemplates);
  };

  const resetToDefaults = () => {
    saveTemplates(allDefaultTemplates);
  };

  const handleTemplateSelect = (template: UnifiedTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate(template);
    setIsNew(false);
    setIsDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setNewTemplate({
      id: '',
      name: '',
      description: '',
      type: 'car',
      generateMessage: (input: any) => typeof input === 'string' ? 
        `היי ${input}! 👋

קיבלנו את הפנייה שלך וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות` : 
        `שלום,

רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:

*${input.make} ${input.model} ${input.year}*
מחיר: ${input.price ? `₪${input.price.toLocaleString()}` : 'בהתאם להצעה'}

בברכה,
צוות המכירות`
    });
    setIsNew(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isNew) {
      addTemplate(newTemplate);
    } else {
      updateTemplate(newTemplate);
    }
    setIsDialogOpen(false);
  };

  // Template tags for the dialog
  const templateTags = [
    // Car tags
    '{{car.make}}', '{{car.model}}', '{{car.year}}', '{{car.price}}', 
    '{{car.mileage}}', '{{car.exteriorColor}}', '{{car.engineSize}}', 
    '{{car.transmission}}', '{{car.fuelType}}',
    // Lead tags
    '{{leadName}}', '{{leadSource}}'
  ];

  if (isMobile) {
    return (
      <MobileContainer>
        <div className="space-y-6" dir="rtl">
          <TemplateHeader
            onNewTemplate={handleNewTemplate}
            onResetDefaults={resetToDefaults}
            canAddTemplate={true}
          />

          <div className="space-y-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleTemplateSelect(template)}
                onDelete={() => deleteTemplate(template.id)}
              />
            ))}
          </div>

          <TemplateDialog
            isOpen={isDialogOpen}
            isNew={isNew}
            newTemplate={newTemplate}
            setIsOpen={setIsDialogOpen}
            onSave={handleSave}
            onTemplateChange={setNewTemplate}
            templateTags={templateTags}
          />
        </div>
      </MobileContainer>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>ניהול תבניות וואטסאפ</CardTitle>
          <CardDescription>
            צור ונהל תבניות הודעות לשליחה מהירה ללקוחות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateHeader
            onNewTemplate={handleNewTemplate}
            onResetDefaults={resetToDefaults}
            canAddTemplate={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleTemplateSelect(template)}
                onDelete={() => deleteTemplate(template.id)}
              />
            ))}
          </div>

          <TemplateDialog
            isOpen={isDialogOpen}
            isNew={isNew}
            newTemplate={newTemplate}
            setIsOpen={setIsDialogOpen}
            onSave={handleSave}
            onTemplateChange={setNewTemplate}
            templateTags={templateTags}
          />
        </CardContent>
      </Card>
    </div>
  );
}
