import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateHeader } from "@/components/templates/TemplateHeader";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { whatsappTemplates, WhatsappTemplate } from "@/components/whatsapp/whatsapp-templates";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";

export default function Templates() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const savedTemplates = localStorage.getItem('whatsapp-templates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      // If saved templates exist but are empty, load defaults
      if (parsed.length === 0) {
        setTemplates(whatsappTemplates);
        localStorage.setItem('whatsapp-templates', JSON.stringify(whatsappTemplates));
      } else {
        setTemplates(parsed);
      }
    } else {
      // No saved templates, load defaults
      setTemplates(whatsappTemplates);
      localStorage.setItem('whatsapp-templates', JSON.stringify(whatsappTemplates));
    }
  }, []);

  const saveTemplates = (newTemplates: WhatsappTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('whatsapp-templates', JSON.stringify(newTemplates));
  };

  const addTemplate = (template: Omit<WhatsappTemplate, 'id'>) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString()
    };
    saveTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (updatedTemplate: WhatsappTemplate) => {
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
    saveTemplates(whatsappTemplates);
    setFilterCategory("all");
    setSearchTerm("");
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === "all" || template.category === filterCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];

  const handleTemplateSelect = (template: WhatsappTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  if (isMobile) {
    return (
      <MobileContainer>
        <div className="space-y-6" dir="rtl">
          <TemplateHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            onAddTemplate={() => {
              setSelectedTemplate(null);
              setIsDialogOpen(true);
            }}
            onResetDefaults={resetToDefaults}
            templatesCount={filteredTemplates.length}
            isMobile={true}
          />

          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleTemplateSelect(template)}
                onDelete={() => deleteTemplate(template.id)}
                isMobile={true}
              />
            ))}
          </div>

          <TemplateDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            template={selectedTemplate}
            onSave={selectedTemplate ? updateTemplate : addTemplate}
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
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            onAddTemplate={() => {
              setSelectedTemplate(null);
              setIsDialogOpen(true);
            }}
            onResetDefaults={resetToDefaults}
            templatesCount={filteredTemplates.length}
            isMobile={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={() => handleTemplateSelect(template)}
                onDelete={() => deleteTemplate(template.id)}
                isMobile={false}
              />
            ))}
          </div>

          <TemplateDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            template={selectedTemplate}
            onSave={selectedTemplate ? updateTemplate : addTemplate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
