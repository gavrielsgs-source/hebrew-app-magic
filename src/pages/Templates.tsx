import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save } from "lucide-react";
import { WhatsappTemplate, templates as defaultTemplates } from "@/components/whatsapp/whatsapp-templates";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';

// Template tag options
const templateTags = [
  "{{make}}", 
  "{{model}}", 
  "{{year}}", 
  "{{price}}", 
  "{{kilometers}}", 
  "{{color}}", 
  "{{engine}}", 
  "{{transmission}}", 
  "{{fuel}}"
];

export default function Templates() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>(() => {
    const savedTemplates = localStorage.getItem('whatsapp-templates');
    return savedTemplates ? JSON.parse(savedTemplates) : defaultTemplates;
  });
  
  const [newTemplate, setNewTemplate] = useState<WhatsappTemplate>({
    id: '',
    name: '',
    template: '',
  });
  
  const [isNew, setIsNew] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { subscription, checkEntitlement } = useSubscription();
  
  const customTemplatesCount = templates.filter(t => t.id.startsWith('custom-')).length;
  const totalTemplatesCount = templates.length;
  const canAddTemplate = checkEntitlement('templateLimit', totalTemplatesCount + 1);
  
  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.template) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }
    
    // Check template limit before saving a new template
    if (isNew && !canAddTemplate) {
      toast({
        title: "הגעת למגבלת התבניות",
        description: `חבילת ${subscription.tier} מוגבלת ל-${subscription.templateLimit} תבניות. שדרג כדי להוסיף עוד.`,
        variant: "destructive",
      });
      return;
    }
    
    if (isNew) {
      const id = `custom-${Date.now()}`;
      const updatedTemplates = [...templates, { ...newTemplate, id }];
      setTemplates(updatedTemplates);
      localStorage.setItem('whatsapp-templates', JSON.stringify(updatedTemplates));
      toast({
        title: "תבנית נשמרה",
        description: "התבנית החדשה נשמרה בהצלחה",
      });
    } else {
      const updatedTemplates = templates.map(t => 
        t.id === newTemplate.id ? newTemplate : t
      );
      setTemplates(updatedTemplates);
      localStorage.setItem('whatsapp-templates', JSON.stringify(updatedTemplates));
      toast({
        title: "תבנית עודכנה",
        description: "התבנית עודכנה בהצלחה",
      });
    }
    
    setIsOpen(false);
    resetForm();
  };
  
  const editTemplate = (template: WhatsappTemplate) => {
    setNewTemplate(template);
    setIsNew(false);
    setIsOpen(true);
  };
  
  const deleteTemplate = (id: string) => {
    if (!id.startsWith('custom-')) {
      toast({
        title: "לא ניתן למחוק",
        description: "לא ניתן למחוק תבניות מערכת מוגדרות מראש",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('whatsapp-templates', JSON.stringify(updatedTemplates));
    toast({
      title: "תבנית נמחקה",
      description: "התבנית נמחקה בהצלחה",
    });
  };
  
  const resetForm = () => {
    setNewTemplate({
      id: '',
      name: '',
      template: '',
    });
    setIsNew(true);
  };
  
  const resetToDefaults = () => {
    setTemplates(defaultTemplates);
    localStorage.setItem('whatsapp-templates', JSON.stringify(defaultTemplates));
    toast({
      title: "איפוס בוצע",
      description: "התבניות אופסו לברירת המחדל",
    });
  };

  const handleNewTemplate = () => {
    if (!canAddTemplate) {
      toast({
        title: "הגעת למגבלת התבניות",
        description: `חבילת ${subscription.tier} מוגבלת ל-${subscription.templateLimit} תבניות. שדרג כדי להוסיף עוד.`,
        variant: "destructive",
      });
      return;
    }
    
    resetForm();
    setIsOpen(true);
  };

  // Filter templates based on subscription tier
  useEffect(() => {
    const limit = subscription.templateLimit;
    if (limit !== undefined && typeof limit === 'number' && limit !== Infinity) {
      // Keep system templates and limit custom ones
      const systemTemplates = templates.filter(t => !t.id.startsWith('custom-'));
      const customTemplates = templates
        .filter(t => t.id.startsWith('custom-'))
        .slice(0, Math.max(0, limit - systemTemplates.length));
      
      const limitedTemplates = [...systemTemplates, ...customTemplates];
      if (limitedTemplates.length < templates.length) {
        setTemplates(limitedTemplates);
        localStorage.setItem('whatsapp-templates', JSON.stringify(limitedTemplates));
      }
    }
  }, [subscription.templateLimit]);

  return (
    <div className="container py-6">
      {/* Display limit warning if needed */}
      <SubscriptionLimitAlert 
        featureKey="templateLimit" 
        currentCount={totalTemplatesCount} 
        entityName="תבניות" 
      />
      
      <TemplateHeader 
        onNewTemplate={handleNewTemplate}
        onResetDefaults={resetToDefaults}
        canAddTemplate={canAddTemplate}
      />
      
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates">תבניות</TabsTrigger>
          <TabsTrigger value="history">היסטוריית תקשורת</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={editTemplate}
                onDelete={deleteTemplate}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <div className="border rounded-md py-8 px-4 text-center bg-muted/30">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">אין נתוני תקשורת להצגה</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                היסטוריית התקשורת תוצג כאן לאחר שליחת הודעות ותיעוד שיחות
              </p>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" /> תעד שיחה
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <TemplateDialog
        isOpen={isOpen}
        isNew={isNew}
        newTemplate={newTemplate}
        setIsOpen={setIsOpen}
        onSave={saveTemplate}
        onTemplateChange={setNewTemplate}
        templateTags={templateTags}
      />
    </div>
  );
}
