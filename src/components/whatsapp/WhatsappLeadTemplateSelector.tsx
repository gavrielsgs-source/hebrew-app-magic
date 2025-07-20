import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpdateLead } from "@/hooks/use-leads";
import { toast } from "sonner";
import { UnifiedTemplate } from "./lead-templates";

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
  const [leadTemplates, setLeadTemplates] = useState<UnifiedTemplate[]>([]);
  const [carTemplates, setCarTemplates] = useState<UnifiedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<UnifiedTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState("lead-templates");
  const [templateType, setTemplateType] = useState<"lead" | "car">("lead");
  const isMobile = useIsMobile();
  const updateLead = useUpdateLead();

  // Load templates from localStorage
  useEffect(() => {
    const storedTemplates = localStorage.getItem("whatsapp-templates");
    console.log('Loading templates from localStorage:', storedTemplates);
    
    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates);
        console.log('Parsed templates:', parsedTemplates);
        
        // Filter lead templates
        const leadTemplatesFromStorage = parsedTemplates
          .filter((t: any) => t.type === 'lead')
          .map((stored: any) => {
            console.log('Processing lead template:', stored.name, 'Content:', stored.templateContent);
            return {
              id: stored.id,
              name: stored.name,
              description: stored.description,
              type: 'lead' as const,
              templateContent: stored.templateContent || '',
              generateMessage: (leadName: string, leadSource?: string) => {
                const content = stored.templateContent || '';
                console.log('Generating message with content:', content);
                if (!content) {
                  return `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`;
                }
                return content
                  .replace(/\{\{leadName\}\}/g, leadName || '')
                  .replace(/\{\{leadSource\}\}/g, leadSource || '')
                  .replace(/\$\{leadName\}/g, leadName || '')
                  .replace(/\$\{leadSource\s*\?\s*`[^`]*\$\{leadSource\}[^`]*`\s*:\s*'[^']*'\}/g, 
                           leadSource ? ` דרך ${leadSource}` : '');
              }
            };
          });

        // Filter car templates  
        const carTemplatesFromStorage = parsedTemplates
          .filter((t: any) => t.type === 'car' && t.templateContent && t.templateContent.trim())
          .map((stored: any) => ({
            id: stored.id,
            name: stored.name,
            description: stored.description,
            type: 'car' as const,
            templateContent: stored.templateContent,
            generateMessage: (leadName: string, leadSource?: string) => {
              const content = stored.templateContent;
              // For car templates, replace lead variables with default car message
              return content
                .replace(/\$\{car\.make\}/g, 'רכב מעולה')
                .replace(/\$\{car\.model\}/g, '')
                .replace(/\$\{car\.year\}/g, '')
                .replace(/\$\{car\.price\s*\?\s*`₪\$\{car\.price\.toLocaleString\(\)\}`\s*:\s*'[^']*'\}/g, 'מחיר אטרקטיבי')
                .replace(/\$\{car\.mileage\s*\?\s*`\$\{car\.mileage\.toLocaleString\(\)\}\s*ק"מ`\s*:\s*'[^']*'\}/g, 'קילומטראז נמוך')
                .replace(/\$\{car\.exterior_color\s*\|\|\s*'[^']*'\}/g, 'צבע יפה')
                .replace(/\$\{car\.engine_size\s*\|\|\s*'[^']*'\}/g, 'מנוע חזק')
                .replace(/\$\{car\.transmission\s*\|\|\s*'[^']*'\}/g, 'תיבת הילוכים מעולה')
                .replace(/\$\{car\.fuel_type\s*\|\|\s*'[^']*'\}/g, 'חסכוני בדלק');
            }
          }));
        
        console.log('Lead templates processed:', leadTemplatesFromStorage);
        console.log('Car templates processed:', carTemplatesFromStorage);
        
        setLeadTemplates(leadTemplatesFromStorage);
        setCarTemplates(carTemplatesFromStorage);
        
        // Set default selection
        if (leadTemplatesFromStorage.length > 0) {
          setSelectedTemplate(leadTemplatesFromStorage[0]);
        } else if (carTemplatesFromStorage.length > 0) {
          setSelectedTemplate(carTemplatesFromStorage[0]);
          setTemplateType("car");
          setActiveTab("car-templates");
        }
        
        // Add default lead template if none exist
        if (leadTemplatesFromStorage.length === 0) {
          const defaultLeadTemplate: UnifiedTemplate = {
            id: 'default_intro',
            name: 'הכרות עם לקוח פוטנציאלי',
            description: 'הודעת היכרות ראשונית עם לקוח שפנה אלינו',
            type: 'lead' as const,
            generateMessage: (leadName: string, leadSource?: string) => `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`
          };
          setLeadTemplates([defaultLeadTemplate]);
          if (!selectedTemplate) {
            setSelectedTemplate(defaultLeadTemplate);
          }
        }
      } catch (error) {
        console.error("Error loading templates:", error);
        // Fallback to default template
        const defaultTemplate: UnifiedTemplate = {
          id: 'default_intro',
          name: 'הכרות עם לקוח פוטנציאלי',
          description: 'הודעת היכרות ראשונית עם לקוח שפנה אלינו',
          type: 'lead' as const,
          generateMessage: (leadName: string, leadSource?: string) => `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`
        };
        setLeadTemplates([defaultTemplate]);
        setSelectedTemplate(defaultTemplate);
      }
    } else {
      // No stored templates, provide default
      const defaultTemplate: UnifiedTemplate = {
        id: 'default_intro',
        name: 'הכרות עם לקוח פוטנציאלי',
        description: 'הודעת היכרות ראשונית עם לקוח שפנה אלינו',
        type: 'lead' as const,
        generateMessage: (leadName: string, leadSource?: string) => `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`
      };
      setLeadTemplates([defaultTemplate]);
      setSelectedTemplate(defaultTemplate);
    }
  }, []);

  const generateMessage = () => {
    if (activeTab === "custom" && customMessage.trim()) {
      return customMessage;
    }
    
    if (selectedTemplate && typeof selectedTemplate.generateMessage === 'function') {
      try {
        return selectedTemplate.generateMessage(leadName, leadSource);
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
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Update lead status to 'in_treatment' after sending WhatsApp message
    if (leadId) {
      await updateLeadStatus();
    }
    
    toast.success(`נפתח וואטסאפ עם ההודעה ל${leadName}${leadId ? ' והליד עבר לסטטוס "בטיפול"' : ''}`);
    onClose();
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
        
        <TabsContent value="lead-templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          {leadTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>לא נמצאו תבניות לקוחות.</p>
              <p className="text-sm mt-2">צור תבניות חדשות בעמוד התבניות.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {leadTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg cursor-pointer transition-colors ${
                    isMobile ? 'p-3' : 'p-4'
                  } ${
                    selectedTemplate?.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setTemplateType("lead");
                  }}
                >
                  <h3 className={`font-medium text-right ${isMobile ? 'text-sm' : ''}`}>
                    {template.name}
                  </h3>
                  <p className={`text-gray-600 text-right mt-1 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="car-templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          {carTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>לא נמצאו תבניות רכבים.</p>
              <p className="text-sm mt-2">צור תבניות חדשות בעמוד התבניות.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {carTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg cursor-pointer transition-colors ${
                    isMobile ? 'p-3' : 'p-4'
                  } ${
                    selectedTemplate?.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setTemplateType("car");
                  }}
                >
                  <h3 className={`font-medium text-right ${isMobile ? 'text-sm' : ''}`}>
                    {template.name}
                  </h3>
                  <p className={`text-gray-600 text-right mt-1 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
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

      <WhatsappTemplatePreview template={message} />

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
