
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { whatsappTemplates, WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { whatsappLeadTemplates, WhatsappLeadTemplate, UnifiedTemplate } from "@/components/whatsapp/lead-templates";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<UnifiedTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState<UnifiedTemplate>({
    id: '',
    name: '',
    description: '',
    type: 'lead',
    generateMessage: () => '',
    templateContent: ''
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Combine all default templates
  const allDefaultTemplates: UnifiedTemplate[] = [
    ...whatsappTemplates,
    ...whatsappLeadTemplates
  ];

  useEffect(() => {
    const savedTemplates = localStorage.getItem('whatsapp-templates');
    console.log('Current localStorage templates:', savedTemplates);
    
    // Force reset localStorage to include templateContent for existing templates
    const shouldReset = !savedTemplates || !savedTemplates.includes('templateContent');
    
    if (shouldReset) {
      console.log('Resetting localStorage with updated templates');
      setTemplates(allDefaultTemplates);
      localStorage.setItem('whatsapp-templates', JSON.stringify(allDefaultTemplates));
    } else {
      const parsed = JSON.parse(savedTemplates);
      // Always ensure templates have templateContent
      const validTemplates = parsed.map((template: any) => ({
        ...template,
        templateContent: template.templateContent || '', 
      }));
      setTemplates(validTemplates);
    }
  }, []);

  const saveTemplates = (newTemplates: UnifiedTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('whatsapp-templates', JSON.stringify(newTemplates));
    console.log('Templates saved to localStorage:', newTemplates);
  };

  const addTemplate = (template: Omit<UnifiedTemplate, 'id'>) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString()
    };
    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    console.log('Template added:', newTemplate);
  };

  const updateTemplate = (updatedTemplate: UnifiedTemplate) => {
    const newTemplates = templates.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    );
    saveTemplates(newTemplates);
    console.log('Template updated:', updatedTemplate);
  };

  const deleteTemplate = (templateId: string) => {
    const templateToDelete = templates.find(t => t.id === templateId);
    if (templateToDelete) {
      const newTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(newTemplates);
      toast({
        title: "התבנית נמחקה",
        description: `התבנית "${templateToDelete.name}" נמחקה בהצלחה.`,
      });
    }
  };

  const resetToDefaults = () => {
    saveTemplates(allDefaultTemplates);
    toast({
      title: "התבניות אופסו",
      description: "כל התבניות חזרו להגדרות המקוריות.",
    });
  };

  const handleTemplateSelect = (template: UnifiedTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate({
      ...template,
      templateContent: template.templateContent || ''
    });
    setIsNew(false);
    setIsDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setNewTemplate({
      id: '',
      name: '',
      description: '',
      type: 'lead',
      templateContent: `היי \${leadName}! 👋

קיבלנו את הפנייה שלך\${leadSource ? \` דרך \${leadSource}\` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`,
      generateMessage: (leadName: string, leadSource?: string) => 
        `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

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

  // Separate templates by type for better organization
  const carTemplates = templates.filter(t => t.type === 'car');
  const leadTemplates = templates.filter(t => t.type === 'lead');

  if (isMobile) {
    return (
      <MobileContainer>
        <div className="space-y-6" dir="rtl">
          <TemplateHeader
            onNewTemplate={handleNewTemplate}
            onResetDefaults={resetToDefaults}
            canAddTemplate={true}
          />

          <div className="space-y-6">
            {leadTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-right">תבניות לקוחות ({leadTemplates.length})</h3>
                <div className="space-y-4">
                  {leadTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleTemplateSelect(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {carTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-right">תבניות רכבים ({carTemplates.length})</h3>
                <div className="space-y-4">
                  {carTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleTemplateSelect(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}
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
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardTitle className="text-foreground">ניהול תבניות וואטסאפ</CardTitle>
          <CardDescription className="text-muted-foreground">
            צור ונהל תבניות הודעות לשליחה מהירה ללקוחות ולרכבים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateHeader
            onNewTemplate={handleNewTemplate}
            onResetDefaults={resetToDefaults}
            canAddTemplate={true}
          />

          <div className="space-y-8">
            {leadTemplates.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-right border-b pb-2">
                  תבניות לקוחות ({leadTemplates.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leadTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleTemplateSelect(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {carTemplates.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-right border-b pb-2">
                  תבניות רכבים ({carTemplates.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={() => handleTemplateSelect(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}
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
