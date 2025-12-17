import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { NonDefaultTemplateWarning } from "./NonDefaultTemplateWarning";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpdateLead } from "@/hooks/use-leads";
import { toast } from "sonner";
import { UnifiedTemplate } from "./lead-templates";
import { useWhatsappTemplates } from "@/hooks/whatsapp-templates";
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
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  const updateLead = useUpdateLead();
  const { data: dbTemplates, isLoading } = useWhatsappTemplates();

  // Extract variables from template content
  const extractVariables = (templateContent: string | undefined): string[] => {
    if (!templateContent) return [];
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  // Get current template variables
  const currentVariables = extractVariables(selectedTemplate?.templateContent);
  const hasCTA = currentVariables.includes('CTA');

  // Initialize variable values when template changes
  useEffect(() => {
    if (selectedTemplate?.templateContent) {
      const vars = extractVariables(selectedTemplate.templateContent);
      const newValues: Record<string, string> = {};
      vars.forEach(v => {
        // Set default values for known variables
        if (v === 'leadName' || v === 'customerName' || v === 'name') {
          newValues[v] = leadName || '';
        } else if (v === 'leadSource') {
          newValues[v] = leadSource ? `דרך ${leadSource}` : '';
        } else if (v === 'CTA') {
          newValues[v] = variableValues['CTA'] || 'לקבוע פגישה';
        } else {
          newValues[v] = variableValues[v] || '';
        }
      });
      setVariableValues(newValues);
    }
  }, [selectedTemplate, leadName, leadSource]);

  // Load templates from database only (source of truth)
  useEffect(() => {
    if (!dbTemplates) return;

    // Convert database templates to UnifiedTemplate format - DB is source of truth
    const dbLeadTemplates: UnifiedTemplate[] = dbTemplates
      .filter(t => t.type === 'lead')
      .map(dbTemplate => ({
        id: dbTemplate.id,
        name: dbTemplate.name,
        description: dbTemplate.description,
        type: 'lead' as const,
        usesCta: dbTemplate.template_content.includes('{{CTA}}'),
        templateContent: dbTemplate.template_content,
        facebookTemplateName: dbTemplate.facebook_template_name,
        generateMessage: (leadName: string, leadSource?: string, cta?: string) => {
          return dbTemplate.template_content
            .replace(/\{\{leadName\}\}/g, leadName || '')
            .replace(/\{\{customerName\}\}/g, leadName || '')
            .replace(/\{\{name\}\}/g, leadName || '')
            .replace(/\{\{leadSource\}\}/g, leadSource ? ` דרך ${leadSource}` : '')
            .replace(/\{\{CTA\}\}/g, cta || 'פגישה');
        }
      }));

    const dbCarTemplates: UnifiedTemplate[] = dbTemplates
      .filter(t => t.type === 'car')
      .map(dbTemplate => ({
        id: dbTemplate.id,
        name: dbTemplate.name,
        description: dbTemplate.description,
        type: 'car' as const,
        usesCta: dbTemplate.template_content.includes('{{CTA}}'),
        templateContent: dbTemplate.template_content,
        facebookTemplateName: dbTemplate.facebook_template_name,
        generateMessage: (car: any, cta?: string) => {
          return dbTemplate.template_content
            .replace(/\{\{carName\}\}/g, car ? `${car.make} ${car.model} ${car.year}` : 'רכב')
            .replace(/\{price\}/g, car?.price ? car.price.toLocaleString() : '')
            .replace(/\{kilometers\}/g, car?.kilometers ? car.kilometers.toLocaleString() : '')
            .replace(/\{mileage\}/g, car?.kilometers ? car.kilometers.toLocaleString() : '')
            .replace(/\{\{CTA\}\}/g, cta || 'לתאם שיחה');
        }
      }));

    setLeadTemplates(dbLeadTemplates);
    setCarTemplates(dbCarTemplates);

    // Set first template as default
    if (dbLeadTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(dbLeadTemplates[0]);
      setTemplateType('lead');
      setActiveTab('lead-templates');
    } else if (dbCarTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(dbCarTemplates[0]);
      setTemplateType('car');
      setActiveTab('car-templates');
    }
  }, [dbTemplates]);

  // Check if selected template is default
  const isSelectedTemplateDefault = () => {
    if (activeTab === "custom") return true; // Custom messages don't need warning
    
    // Find the selected template name and check if it's default in DB
    const selectedTemplateName = selectedTemplate?.name;
    const dbTemplate = dbTemplates?.find(t => t.name === selectedTemplateName);
    return dbTemplate?.is_default ?? false;
  };

  const ctaOptions = [
    { value: "לקבוע פגישה", label: "לקבוע פגישה" },
    { value: "לתאם צפייה", label: "לתאם צפייה" },
    { value: "לקבוע שיחה קצרה", label: "לקבוע שיחה קצרה" },
    { value: "להתייעץ", label: "להתייעץ" },
    { value: "לקבל הצעת מחיר", label: "לקבל הצעת מחיר" },
    { value: "custom", label: "טקסט מותאם אישית" },
  ];
  
  const [customCta, setCustomCta] = useState("");

  const getVariableLabel = (varName: string): string => {
    const labels: Record<string, string> = {
      'leadName': 'שם הליד',
      'customerName': 'שם הלקוח',
      'name': 'שם',
      'leadSource': 'מקור הליד',
      'CTA': 'קריאה לפעולה',
      'carDetails': 'פרטי הרכב',
    };
    return labels[varName] || varName;
  };

  const generateMessage = () => {
    if (activeTab === "custom" && customMessage.trim()) {
      return customMessage;
    }
    
    if (selectedTemplate?.templateContent) {
      let message = selectedTemplate.templateContent;
      // Replace all variables with their values
      Object.entries(variableValues).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      });
      return message;
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
        
        <TabsContent value="lead-templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
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
                      <SelectItem key={template.id} value={template.id} className="text-right cursor-pointer pl-8 pr-2 flex-row-reverse">
                        <div className="flex flex-col items-end w-full">
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

        <TabsContent value="car-templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
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
                      <SelectItem key={template.id} value={template.id} className="text-right cursor-pointer pl-8 pr-2 flex-row-reverse">
                        <div className="flex flex-col items-end w-full">
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

      {activeTab !== "custom" && currentVariables.length > 0 && (
        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <label className="block text-sm font-medium text-right">משתנים בתבנית</label>
          {currentVariables.map((varName) => (
            <div key={varName} className="space-y-1">
              <label className="text-xs text-muted-foreground text-right block">
                {getVariableLabel(varName)}
              </label>
              {varName === 'CTA' ? (
                <div className="space-y-2">
                  <Select 
                    value={ctaOptions.slice(0, -1).some(o => o.value === variableValues[varName]) ? variableValues[varName] : 'custom'} 
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setVariableValues(prev => ({ ...prev, [varName]: customCta || '' }));
                      } else {
                        setVariableValues(prev => ({ ...prev, [varName]: value }));
                        setCustomCta('');
                      }
                    }}
                  >
                    <SelectTrigger className="w-full text-right" dir="rtl">
                      <SelectValue placeholder="בחר פעולה..." />
                    </SelectTrigger>
                    <SelectContent align="end" dir="rtl" className="bg-background z-[9999]">
                      {ctaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-right pl-8 pr-2 flex-row-reverse">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!ctaOptions.slice(0, -1).some(o => o.value === variableValues[varName]) && (
                    <Input
                      placeholder="הזן קריאה לפעולה מותאמת אישית"
                      value={customCta || variableValues[varName] || ''}
                      onChange={(e) => {
                        setCustomCta(e.target.value);
                        setVariableValues(prev => ({ ...prev, [varName]: e.target.value }));
                      }}
                      className="text-right"
                      dir="rtl"
                    />
                  )}
                </div>
              ) : (
                <Input
                  type="text"
                  value={variableValues[varName] || ''}
                  onChange={(e) => setVariableValues(prev => ({ ...prev, [varName]: e.target.value }))}
                  placeholder={`הכנס ${getVariableLabel(varName)}...`}
                  className="text-right"
                  dir="rtl"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Non-Default Template Warning */}
      {!isSelectedTemplateDefault() && message && message.trim() && (
        <NonDefaultTemplateWarning 
          phoneNumber={leadPhone} 
          message={message} 
        />
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
