
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { WhatsappTemplate, templates as defaultTemplates } from "@/components/whatsapp/whatsapp-templates";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { Plus, FileText, Edit, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.template) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות הנדרשים",
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
    // Don't allow deleting default templates
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

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">תבניות הודעה</h1>
          <p className="text-muted-foreground">ניהול תבניות לשליחת הודעות ללקוחות</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> צור תבנית חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isNew ? 'תבנית חדשה' : 'עריכת תבנית'}</DialogTitle>
                <DialogDescription>
                  צור תבנית מותאמת אישית לשליחת הודעות. השתמש ב-{{make}}, {{model}}, וכו' כדי לכלול פרטים מהרכב.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    שם התבנית
                  </Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="col-span-3"
                    placeholder="תבנית תיאום פגישה"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template" className="text-right">
                    תוכן התבנית
                  </Label>
                  <Textarea
                    id="template"
                    value={newTemplate.template}
                    onChange={(e) => setNewTemplate({ ...newTemplate, template: e.target.value })}
                    className="col-span-3"
                    rows={10}
                    placeholder="שלום,&#10;&#10;רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:&#10;&#10;*{{make}} {{model}} {{year}}*&#10;מחיר: {{price}}&#10;..."
                  />
                </div>
                <div className="col-span-4">
                  <p className="text-sm text-muted-foreground mb-2">תגיות זמינות:</p>
                  <div className="flex flex-wrap gap-2">
                    {templateTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewTemplate({
                            ...newTemplate,
                            template: newTemplate.template + tag
                          });
                        }}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}>
                  ביטול
                </Button>
                <Button type="submit" onClick={saveTemplate}>
                  {isNew ? 'שמור תבנית' : 'עדכן תבנית'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={resetToDefaults}>
            איפוס לברירת מחדל
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates">תבניות</TabsTrigger>
          <TabsTrigger value="history">היסטוריית תקשורת</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => editTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> תבנית וואטסאפ
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-28 overflow-y-auto">
                  <div className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                    {template.template}
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        תצוגה מקדימה
                      </Button>
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
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>היסטוריית תקשורת</CardTitle>
              <CardDescription>
                מעקב אחר הודעות שנשלחו, שיחות טלפון ופגישות
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
