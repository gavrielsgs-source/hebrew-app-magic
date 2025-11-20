import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpdateLead } from "@/hooks/use-leads";
import { toast } from "sonner";
import { UnifiedTemplate } from "./lead-templates";
import { useWhatsappTemplates } from "@/hooks/whatsapp-templates";
import { whatsappTemplates } from "./whatsapp-templates";
import { whatsappLeadTemplates } from "./lead-templates";
import { supabase } from "@/integrations/supabase/client";

interface WhatsappLeadTemplateSelectorProps {
  leadName: string;
  leadPhone: string;
  leadSource?: string;
  leadId?: string;
  onClose: () => void;
}

export function WhatsappLeadTemplateSelector({ 
  leadName, 
  leadPhone, 
  leadSource,
  leadId,
  onClose 
}: WhatsappLeadTemplateSelectorProps) {
  const [leadTemplates, setLeadTemplates] = useState<any[]>([]);
  const [carTemplates, setCarTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<UnifiedTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState("lead-templates");
  const [templateType, setTemplateType] = useState<"lead" | "car">("lead");
  const [selectedCTA, setSelectedCTA] = useState<string>("פגישה");
  const [customCTA, setCustomCTA] = useState<string>("");
  const isMobile = useIsMobile();
  const updateLead = useUpdateLead();
  const { data: dbTemplates, isLoading } = useWhatsappTemplates();

  // Load templates from localStorage and merge with database templates and default templates
  useEffect(() => {
    try {
      // Convert database templates to UnifiedTemplate format
      const dbLeadTemplates: UnifiedTemplate[] = (dbTemplates || [])
        .filter(t => t.type === 'lead')
        .map(dbTemplate => ({
          id: dbTemplate.id,
          name: dbTemplate.name,
          description: dbTemplate.description,
          type: 'lead' as const,
          templateContent: dbTemplate.template_content,
          generateMessage: (leadName: string, leadSource?: string, cta?: string) => {
            return dbTemplate.template_content
              .replace(/\{\{leadName\}\}/g, leadName || '')
              .replace(/\{\{leadSource\}\}/g, leadSource ? ` דרך ${leadSource}` : '')
              .replace(/\{\{CTA\}\}/g, cta || 'פגישה')
              .replace(/\$\{leadName\}/g, leadName || '')
              .replace(/\$\{leadSource\s*\?\s*`[^`]*\$\{leadSource\}[^`]*`\s*:\s*'[^']*'\}/g, leadSource ? ` דרך ${leadSource}` : '');
          }
        }));

      const dbCarTemplates: UnifiedTemplate[] = (dbTemplates || [])
        .filter(t => t.type === 'car')
        .map(dbTemplate => ({
          id: dbTemplate.id,
          name: dbTemplate.name,
          description: dbTemplate.description,
          type: 'car' as const,
          templateContent: dbTemplate.template_content,
          generateMessage: (car: any, cta?: string) => {
            return dbTemplate.template_content
              .replace(/\{make\}/g, car?.make || 'רכב')
              .replace(/\{model\}/g, car?.model || '')
              .replace(/\{year\}/g, car?.year || '')
              .replace(/\{price\}/g, car?.price ? car.price.toLocaleString() : '')
              .replace(/\{kilometers\}/g, car?.kilometers ? car.kilometers.toLocaleString() : '')
              .replace(/\{mileage\}/g, car?.kilometers ? car.kilometers.toLocaleString() : '')
              .replace(/\{\{CTA\}\}/g, cta || 'לתאם שיחה');
          }
        }));

      // Merge with default templates (default templates first, then DB templates override if same ID)
      const allLeadTemplates: any[] = [...whatsappLeadTemplates];
      dbLeadTemplates.forEach(dbTemplate => {
        const existingIndex = allLeadTemplates.findIndex(t => t.id === dbTemplate.id);
        if (existingIndex >= 0) {
          allLeadTemplates[existingIndex] = dbTemplate;
        } else {
          allLeadTemplates.push(dbTemplate);
        }
      });

      const allCarTemplates: any[] = [...whatsappTemplates];
      dbCarTemplates.forEach(dbTemplate => {
        const existingIndex = allCarTemplates.findIndex(t => t.id === dbTemplate.id);
        if (existingIndex >= 0) {
          allCarTemplates[existingIndex] = dbTemplate;
        } else {
          allCarTemplates.push(dbTemplate);
        }
      });

      setLeadTemplates(allLeadTemplates);
      setCarTemplates(allCarTemplates);

      // Set first template as default
      if (allLeadTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(allLeadTemplates[0]);
        setTemplateType('lead');
        setActiveTab('lead-templates');
      } else if (allCarTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(allCarTemplates[0]);
        setTemplateType('car');
        setActiveTab('car-templates');
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      const defaultTemplate: UnifiedTemplate = {
        id: 'default_intro',
        name: 'הכרות עם לקוח פוטנציאלי',
        description: 'הודעת היכרות ראשונית עם לקוח שפנה אלינו',
        type: 'lead' as const,
        generateMessage: (leadName: string, leadSource?: string) => `היי ${leadName}! 👋\n\nקיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.\n\nמתי תהיה זמין לשיחת ייעוץ קצרה? 📞\n\nנשמח לעזור לך למצוא בדיוק מה שמתאים לך!\n\nבברכה,\nצוות המכירות`
      };
      setLeadTemplates([defaultTemplate]);
      setSelectedTemplate(defaultTemplate);
    }
  }, [dbTemplates]);

  const ctaOptions = [
    { value: "פגישה", label: "פגישה" },
    { value: "לקבוע שיחה", label: "לקבוע שיחה" },
    { value: "לקבוע נסיעת מבחן", label: "לקבוע נסיעת מבחן" },
    { value: "custom", label: "טקסט חופשי" }
  ];

  const getCurrentCTA = () => {
    if (selectedCTA === "custom") {
      return customCTA || "פגישה";
    }
    return selectedCTA;
  };

  const generateMessage = () => {
    if (activeTab === "custom" && customMessage.trim()) {
      return customMessage;
    }
    
    if (selectedTemplate && typeof selectedTemplate.generateMessage === 'function') {
      try {
        const cta = getCurrentCTA();
        return selectedTemplate.generateMessage(leadName, leadSource, cta);
      } catch (error) {
        console.error('Error generating message:', error);
        return `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`;
      }
    }

    return "";
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    if (cleanPhone.startsWith('0')) {
      return '972' + cleanPhone.substring(1);
    }
    
    return '972' + cleanPhone;
  };

  const updateLeadStatus = async () => {
    if (!leadId) return;
    
    try {
      await updateLead.mutateAsync({ 
        id: leadId, 
        data: { 
          status: 'in_treatment',
          updated_at: new Date().toISOString()
        } 
      });
      console.log(`Lead ${leadId} status updated to 'in_treatment'`);
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const handleSendMessage = async () => {
    const message = generateMessage();
    
    if (!message.trim()) {
      toast.error("אנא בחר תבנית או כתוב הודעה לפני השליחה");
      return;
    }

    const formattedPhone = formatPhoneForWhatsApp(leadPhone);
    
    try {
      // Send via WhatsApp Bot API
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          type: 'text',
          to: formattedPhone,
          message: message
        }
      });

      if (error) {
        throw new Error((error as any).message || 'שגיאה בשליחת הודעה');
      }

      const status = (data as any)?.messageStatus || 'sent';
      toast.success(`ההודעה נשלחה ל${leadName} (${status})${leadId ? ' והליד עבר לסטטוס "בטיפול"' : ''}`);
      
      // Update lead status to 'in_treatment' after sending WhatsApp message
      if (leadId) {
        await updateLeadStatus();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast.error(error?.message || "שגיאה בשליחת ההודעה");
    }
  };

  const message = generateMessage();

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`} dir="rtl">
      <div>
        <h2 className={`font-semibold mb-2 text-right ${isMobile ? 'text-lg' : 'text-xl'}`}>
          שליחת הודעה ל{leadName}
        </h2>
        <p className={`text-gray-600 text-right ${isMobile ? 'text-sm' : ''}`}>
          בחר תבנית הודעה מתאימה להתחלת שיחה
        </p>
        {leadSource && (
          <p className={`text-blue-600 text-right text-sm mt-1`}>
            מקור הליד: {leadSource}
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className={`w-full ${isMobile ? 'h-auto grid-cols-3 text-xs' : 'grid grid-cols-3'}`}>
          <TabsTrigger value="lead-templates" className={isMobile ? "text-xs" : ""}>
            תבניות לקוחות ({leadTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="car-templates" className={isMobile ? "text-xs" : ""}>
            תבניות רכבים ({carTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className={isMobile ? "text-xs" : ""}>הודעה מותאמת</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lead-templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''} overflow-y-auto max-h-[60vh]`}>
          {leadTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>לא נמצאו תבניות לקוחות.</p>
              <p className="text-sm mt-2">צור תבניות חדשות בעמוד התבניות.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-right block mb-2">בחר תבנית:</label>
                <Select
                  value={selectedTemplate?.id || ""}
                  onValueChange={(value) => {
                    const template = leadTemplates.find(t => t.id === value);
                    if (template) {
                      setSelectedTemplate(template);
                      setTemplateType("lead");
                    }
                  }}
                >
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="בחר תבנית לקוח" />
                  </SelectTrigger>
                  <SelectContent align="end" className="max-h-[300px] overflow-y-auto bg-background z-[9999]" dir="rtl">
                    {leadTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-right cursor-pointer">
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTemplate && templateType === "lead" && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-2 text-right">תצוגה מקדימה:</p>
                  <div className="text-sm text-right whitespace-pre-wrap">
                    {typeof selectedTemplate.generateMessage === 'function' 
                      ? selectedTemplate.generateMessage(leadName, leadSource) 
                      : selectedTemplate.templateContent || ''}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="car-templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''} overflow-y-auto max-h-[60vh]`}>
          {carTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>לא נמצאו תבניות רכבים.</p>
              <p className="text-sm mt-2">צור תבניות חדשות בעמוד התבניות.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-right block mb-2">בחר תבנית:</label>
                <Select
                  value={selectedTemplate?.id || ""}
                  onValueChange={(value) => {
                    const template = carTemplates.find(t => t.id === value);
                    if (template) {
                      setSelectedTemplate(template);
                      setTemplateType("car");
                    }
                  }}
                >
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="בחר תבנית רכב" />
                  </SelectTrigger>
                  <SelectContent align="end" className="max-h-[300px] overflow-y-auto bg-background z-[9999]" dir="rtl">
                    {carTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-right cursor-pointer">
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTemplate && templateType === "car" && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-2 text-right">תצוגה מקדימה:</p>
                  <div className="text-sm text-right whitespace-pre-wrap">
                    {selectedTemplate.templateContent || ''}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className={`space-y-4 ${isMobile ? 'space-y-3' : ''} overflow-y-auto max-h-[60vh]`}>
          <div>
            <label className="block text-sm font-medium mb-2">כתוב הודעה מותאמת אישית</label>
            <Textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`שלום ${leadName},\n\n[כתוב כאן את ההודעה שלך]\n\nבברכה,\nצוות המכירות`}
              className="text-right"
              dir="rtl"
            />
          </div>
        </TabsContent>
      </Tabs>

      {activeTab !== "custom" && (
        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <label className="block text-sm font-medium text-right">בחר פעולה (CTA)</label>
          <Select value={selectedCTA} onValueChange={setSelectedCTA}>
            <SelectTrigger className="w-full text-right" dir="rtl">
              <SelectValue placeholder="בחר פעולה..." />
            </SelectTrigger>
            <SelectContent>
              {ctaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-right">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCTA === "custom" && (
            <div className="mt-3">
              <Input
                type="text"
                value={customCTA}
                onChange={(e) => setCustomCTA(e.target.value)}
                placeholder="הכנס טקסט חופשי..."
                className="text-right"
                dir="rtl"
              />
            </div>
          )}
        </div>
      )}

      {message && message.trim() && (
        <WhatsappTemplatePreview template={message} />
      )}

      <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
        <Button 
          onClick={handleSendMessage}
          className={`bg-green-600 hover:bg-green-700 text-white ${
            isMobile ? 'flex-1 order-1' : 'flex-1'
          }`}
          disabled={!message.trim()}
        >
          שלח בוואטסאפ ל{leadName}
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
          className={isMobile ? 'order-2' : ''}
        >
          ביטול
        </Button>
      </div>
    </div>
  );
}
