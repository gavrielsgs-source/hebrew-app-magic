import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { useToast } from "@/hooks/use-toast";
import { useRealAdminCheck } from "@/hooks/use-real-admin-check";
import { Navigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";

import { 
  useWhatsappTemplates,
  useCreateWhatsappTemplate,
  useUpdateWhatsappTemplate,
  useDeleteWhatsappTemplate
} from "@/hooks/whatsapp-templates";

// Define types for templates - matches database structure
type TemplateType = 'car' | 'lead';

interface DbTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  template_content?: string;
  templateContent?: string;
  is_default?: boolean;
  is_shared?: boolean;
  user_id?: string;
  facebook_template_name?: string;
}

export default function Templates() {
  const { isAdmin, isLoading: adminLoading } = useRealAdminCheck();
  const [selectedTemplate, setSelectedTemplate] = useState<DbTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState<DbTemplate>({
    id: '',
    name: '',
    description: '',
    type: 'lead',
    templateContent: ''
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { data: dbTemplates, isLoading } = useWhatsappTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateWhatsappTemplate();
  const { mutate: updateDbTemplate, isPending: isUpdating } = useUpdateWhatsappTemplate();
  const { mutate: deleteDbTemplate, isPending: isDeleting } = useDeleteWhatsappTemplate();

  if (adminLoading) return null;
  if (!isAdmin) {
    sonnerToast.error("אין לך הרשאות לדף זה");
    return <Navigate to="/dashboard" replace />;
  }

  // Read templates directly from database
  const templates: DbTemplate[] = dbTemplates?.map(t => ({
    ...t,
    templateContent: t.template_content || '',
  })) || [];

  const addTemplate = (template: Omit<DbTemplate, 'id'>) => {
    // Save directly to database
    createTemplate({
      name: template.name,
      description: template.description || '',
      type: newTemplate.type,
      template_content: newTemplate.templateContent || '',
      is_shared: false,
    });
    
    console.log('Template added:', newTemplate);
    toast({
      title: "התבנית נוספה ונשמרה בענן",
      description: `התבנית "${newTemplate.name}" נוצרה בהצלחה.`,
    });
  };

  const updateTemplate = (updatedTemplate: DbTemplate) => {
    // Update directly in database
    updateDbTemplate({
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      description: updatedTemplate.description || '',
      template_content: updatedTemplate.templateContent || '',
    });
    
    console.log('Template updated:', updatedTemplate);
  };

  const deleteTemplate = (templateId: string) => {
    // Check if this is a default template
    const templateToDelete = templates.find(t => t.id === templateId);
    
    if (templateToDelete?.is_default) {
      toast({
        title: "לא ניתן למחוק תבנית ברירת מחדל",
        description: "תבניות ברירת המחדל של המערכת לא ניתנות למחיקה.",
        variant: "destructive",
      });
      return;
    }
    
    if (templateToDelete) {
      deleteDbTemplate(templateId);
      console.log('Template deleted:', templateId);
    }
  };

  const exportToExcel = () => {
    // Create CSV content
    const csvContent = [
      ['שם', 'תיאור', 'סוג', 'תוכן'],
      ...templates.map(t => [
        t.name,
        t.description,
        t.type === 'lead' ? 'ליד' : t.type === 'car' ? 'רכב' : 'לקוח',
        t.templateContent || ''
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whatsapp-templates-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "הקובץ יוצא בהצלחה",
      description: "התבניות יוצאו לקובץ CSV.",
    });
  };

  const handleTemplateSelect = (template: DbTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate({
      ...template,
      templateContent: template.templateContent || template.template_content || ''
    });
    setIsNew(false);
    setIsDialogOpen(true);
  };

  const handleNewTemplate = (type: TemplateType) => {
    setNewTemplate({
      id: `custom-${Date.now()}`,
      name: '',
      description: '',
      type,
      templateContent: ''
    });
    setIsNew(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isNew) {
      addTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        type: newTemplate.type,
        templateContent: newTemplate.templateContent
      });
    } else {
      updateTemplate(newTemplate);
    }
    setIsDialogOpen(false);
  };

  const leadTemplates = templates.filter((t) => t.type === 'lead');
  const carTemplates = templates.filter((t) => t.type === 'car');

  const templateTags = [
    '{{leadName}}',
    '{{leadPhone}}',
    '{{leadSource}}',
    '{{carMake}}',
    '{{carModel}}',
    '{{carYear}}',
    '{{carPrice}}',
    '{{carKilometers}}',
    '{{customerName}}',
    '{{CTA}}'
  ];

  if (isMobile) {
    return (
      <MobileContainer>
        <div className="p-4 space-y-4">
          <TemplateHeader onNewTemplate={() => {}} />
          

          <div className="space-y-6">
            {leadTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-right">תבניות לקוחות ({leadTemplates.length})</h3>
                <div className="space-y-4">
                  {leadTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template as any}
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
                      template={template as any}
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
            newTemplate={newTemplate as any}
            setIsOpen={setIsDialogOpen}
            onSave={handleSave}
            onTemplateChange={setNewTemplate as any}
            templateTags={templateTags}
            readOnly={!!newTemplate.is_default}
          />
        </div>
      </MobileContainer>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">ניהול תבניות WhatsApp</CardTitle>
            <CardDescription className="text-right">
              נהל ושפר את תבניות ההודעות שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateHeader onNewTemplate={() => {}} />
            

            <div className="space-y-6">
              {leadTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-right">תבניות לקוחות ({leadTemplates.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leadTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template as any}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {carTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template as any}
                        onEdit={() => handleTemplateSelect(template)}
                        onDelete={() => deleteTemplate(template.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <TemplateDialog
          isOpen={isDialogOpen}
          isNew={isNew}
          newTemplate={newTemplate as any}
          setIsOpen={setIsDialogOpen}
          onSave={handleSave}
          onTemplateChange={setNewTemplate as any}
          templateTags={templateTags}
          readOnly={!!newTemplate.is_default}
        />
      </div>
    </ScrollArea>
  );
}
