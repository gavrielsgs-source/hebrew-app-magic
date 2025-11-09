import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { useSubscription } from "@/contexts/subscription-context";
import { useWhatsappTemplates } from "@/hooks/whatsapp/use-whatsapp-templates";
import { useCreateTemplate } from "@/hooks/whatsapp/use-create-template";
import { useUpdateTemplate } from "@/hooks/whatsapp/use-update-template";
import { useDeleteTemplate } from "@/hooks/whatsapp/use-delete-template";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function Templates() {
  const isMobile = useIsMobile();
  const { subscription } = useSubscription();
  
  const { data: templates = [], isLoading } = useWhatsappTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const addTemplate = (template: any) => {
    createTemplate.mutate({
      name: template.name,
      description: template.description,
      type: template.type,
      template_content: template.templateContent,
    });
    setShowDialog(false);
  };

  const handleUpdateTemplate = (id: string, updatedTemplate: any) => {
    updateTemplate.mutate({
      id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      type: updatedTemplate.type,
      template_content: updatedTemplate.templateContent,
    });
    setShowDialog(false);
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template?.is_default) {
      toast.error('לא ניתן למחוק תבניות ברירת מחדל');
      return;
    }
    deleteTemplate.mutate(id);
  };

  const exportToExcel = () => {
    const BOM = '\uFEFF';
    const headers = ['שם', 'תיאור', 'סוג', 'תוכן'].join(',');
    const rows = templates.map(t => 
      [t.name, t.description, t.type === 'car' ? 'רכב' : 'ליד', t.template_content].join(',')
    );
    const csv = BOM + [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'whatsapp-templates.csv';
    link.click();
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate({
      ...template,
      templateContent: template.template_content,
    });
    setIsNew(false);
    setShowDialog(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      description: '',
      type: 'lead',
      templateContent: 'שלום {leadName}, תודה שפנית אלינו!'
    });
    setIsNew(true);
    setShowDialog(true);
  };

  const migrateFromLocalStorage = async () => {
    setIsMigrating(true);
    try {
      const stored = localStorage.getItem('whatsapp-templates');
      if (!stored) {
        toast.error('לא נמצאו תבניות ב-localStorage');
        return;
      }

      const parsed = JSON.parse(stored);
      const localTemplates = parsed.templates || parsed || [];

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('יש להתחבר כדי לבצע מיגרציה');
        return;
      }

      const { data, error } = await supabase.functions.invoke('migrate-templates', {
        body: { templates: localTemplates }
      });

      if (error) throw error;

      toast.success(data.message || 'המיגרציה הושלמה בהצלחה!');
      
      // Clear localStorage after successful migration
      localStorage.removeItem('whatsapp-templates');
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error('שגיאה במיגרציה: ' + error.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const templateTags = [
    { car: ['{{make}}', '{{model}}', '{{year}}', '{{price}}', '{{kilometers}}'] },
    { lead: ['{{leadName}}', '{{leadSource}}'] }
  ];

  const carTemplates = templates.filter(t => t.type === 'car');
  const leadTemplates = templates.filter(t => t.type === 'lead');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">טוען תבניות...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileContainer>
        <div className="space-y-4" dir="rtl">
          <MobileHeader title="תבניות וואטסאפ" />
          
          <TemplateHeader 
            onNewTemplate={handleNewTemplate}
            onExport={exportToExcel}
          />
          
          {localStorage.getItem('whatsapp-templates') && (
            <Card className="p-4 mb-6 bg-muted/50">
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold">מיגרציה מ-localStorage</h3>
                  <p className="text-sm text-muted-foreground">
                    נמצאו תבניות ישנות במכשיר שלך
                  </p>
                </div>
                <Button 
                  onClick={migrateFromLocalStorage} 
                  disabled={isMigrating}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  {isMigrating ? 'מעביר...' : 'העבר תבניות'}
                </Button>
              </div>
            </Card>
          )}

          <Tabs defaultValue="lead" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="lead" className="flex-1">
                תבניות לידים ({leadTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="car" className="flex-1">
                תבניות רכבים ({carTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lead" className="space-y-3 mt-4">
              {leadTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={{
                    ...template,
                    templateContent: template.template_content,
                  }}
                  onEdit={() => handleTemplateSelect(template)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                />
              ))}
            </TabsContent>

            <TabsContent value="car" className="space-y-3 mt-4">
              {carTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={{
                    ...template,
                    templateContent: template.template_content,
                  }}
                  onEdit={() => handleTemplateSelect(template)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                />
              ))}
            </TabsContent>
          </Tabs>

          <TemplateDialog
            open={showDialog}
            isNew={isNew}
            newTemplate={selectedTemplate}
            onOpenChange={setShowDialog}
            onSave={(template) => {
              if (isNew) {
                addTemplate(template);
              } else {
                handleUpdateTemplate(selectedTemplate.id, template);
              }
            }}
            onTemplateChange={setSelectedTemplate}
            templateTags={templateTags}
            readOnly={selectedTemplate?.is_default || false}
          />
        </div>
      </MobileContainer>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <Card>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">תבניות וואטסאפ</h1>
            <p className="text-muted-foreground">נהל את התבניות שלך לשליחת הודעות</p>
          </div>

          <TemplateHeader 
            onNewTemplate={handleNewTemplate}
            onExport={exportToExcel}
          />
          
          {localStorage.getItem('whatsapp-templates') && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">מיגרציה מ-localStorage</h3>
                  <p className="text-sm text-muted-foreground">
                    נמצאו תבניות ישנות במכשיר שלך. העבר אותן לדאטהבייס
                  </p>
                </div>
                <Button 
                  onClick={migrateFromLocalStorage} 
                  disabled={isMigrating}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  {isMigrating ? 'מעביר...' : 'העבר תבניות'}
                </Button>
              </div>
            </Card>
          )}

          <Tabs defaultValue="lead" className="w-full">
            <TabsList>
              <TabsTrigger value="lead">
                תבניות לידים ({leadTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="car">
                תבניות רכבים ({carTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lead" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leadTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={{
                      ...template,
                      templateContent: template.template_content,
                    }}
                    onEdit={() => handleTemplateSelect(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="car" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={{
                      ...template,
                      templateContent: template.template_content,
                    }}
                    onEdit={() => handleTemplateSelect(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <TemplateDialog
            open={showDialog}
            isNew={isNew}
            newTemplate={selectedTemplate}
            onOpenChange={setShowDialog}
            onSave={(template) => {
              if (isNew) {
                addTemplate(template);
              } else {
                handleUpdateTemplate(selectedTemplate.id, template);
              }
            }}
            onTemplateChange={setSelectedTemplate}
            templateTags={templateTags}
            readOnly={selectedTemplate?.is_default || false}
          />
        </div>
      </Card>
    </div>
  );
}
