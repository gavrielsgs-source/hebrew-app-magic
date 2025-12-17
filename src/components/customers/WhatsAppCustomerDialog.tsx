import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Send, ExternalLink, Users, Car as CarIcon } from "lucide-react";
import { NonDefaultTemplateWarning } from "@/components/whatsapp/NonDefaultTemplateWarning";
import { formatPhoneForWhatsApp } from "@/utils/phone-utils";
import { supabase } from "@/integrations/supabase/client";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { useWhatsappTemplates } from "@/hooks/whatsapp-templates";
import type { Customer } from "@/types/customer";

interface WhatsAppCustomerDialogProps {
  customer: Customer;
  onClose: () => void;
}

interface ConvertedTemplate {
  id: string;
  name: string;
  description: string;
  type: 'lead' | 'car';
  templateContent: string;
  facebookTemplateName: string | null;
}

export function WhatsAppCustomerDialog({ customer, onClose }: WhatsAppCustomerDialogProps) {
  const [activeTab, setActiveTab] = useState<"lead" | "car" | "custom">("lead");
  const [leadTemplates, setLeadTemplates] = useState<ConvertedTemplate[]>([]);
  const [carTemplates, setCarTemplates] = useState<ConvertedTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedCta, setSelectedCta] = useState("לקבוע פגישה");
  const [customCta, setCustomCta] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const { data: dbTemplates } = useWhatsappTemplates();

  // Load templates from DB
  useEffect(() => {
    if (!dbTemplates) return;

    const convertedLeadTemplates: ConvertedTemplate[] = dbTemplates
      .filter(t => t.type === 'lead')
      .map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        type: 'lead' as const,
        templateContent: t.template_content,
        facebookTemplateName: t.facebook_template_name,
      }));

    const convertedCarTemplates: ConvertedTemplate[] = dbTemplates
      .filter(t => t.type === 'car')
      .map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        type: 'car' as const,
        templateContent: t.template_content,
        facebookTemplateName: t.facebook_template_name,
      }));

    setLeadTemplates(convertedLeadTemplates);
    setCarTemplates(convertedCarTemplates);

    // Select first lead template by default
    if (convertedLeadTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(convertedLeadTemplates[0].id);
    }
  }, [dbTemplates]);

  // Get selected template
  const selectedTemplate = activeTab === "lead" 
    ? leadTemplates.find(t => t.id === selectedTemplateId)
    : activeTab === "car"
    ? carTemplates.find(t => t.id === selectedTemplateId)
    : null;

  // Extract variables from template
  const templateVariables = selectedTemplate?.templateContent
    ?.match(/\{\{([^}]+)\}\}/g)
    ?.map((v: string) => v.replace(/\{\{|\}\}/g, '')) || [];
  const hasCta = templateVariables.includes('CTA');

  // Initialize variable values when template changes
  useEffect(() => {
    if (selectedTemplate?.templateContent) {
      const initialValues: Record<string, string> = {};
      templateVariables.forEach((variable: string) => {
        const existingValue = variableValues[variable];
        if (variable === 'leadName' || variable === 'customerName' || variable === 'name' || variable === 'clientName') {
          initialValues[variable] = existingValue || customer.full_name || '';
        } else if (variable === 'CTA') {
          initialValues[variable] = existingValue || selectedCta;
        } else {
          initialValues[variable] = existingValue || '';
        }
      });
      setVariableValues(initialValues);
    }
  }, [selectedTemplateId, selectedTemplate, customer.full_name]);

  // Get current CTA
  const getCurrentCta = () => {
    return selectedCta === "custom" ? customCta : selectedCta;
  };

  // Generate message based on template
  const generateCustomerMessage = () => {
    if (activeTab === "custom") {
      return customMessage;
    }

    if (!selectedTemplate?.templateContent) return "";

    let message = selectedTemplate.templateContent;
    Object.entries(variableValues).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    return message;
  };

  // Check if template has facebook_template_name
  const hasApprovedTemplate = () => {
    if (activeTab === "custom") return false;
    return !!selectedTemplate?.facebookTemplateName;
  };

  // Generate WhatsApp link for free text messages
  const generateWhatsAppLink = () => {
    const formattedNumber = formatPhoneForWhatsApp(customer.phone || '');
    const message = encodeURIComponent(generateCustomerMessage());
    return `https://wa.me/${formattedNumber}?text=${message}`;
  };

  const handleSend = async () => {
    if (!customer.phone) {
      toast.error("לא נמצא מספר טלפון ללקוח");
      return;
    }

    const formattedNumber = formatPhoneForWhatsApp(customer.phone);
    const messageText = generateCustomerMessage();

    if (!messageText.trim()) {
      toast.error("יש להזין תוכן הודעה");
      return;
    }

    try {
      setIsSending(true);

      if (selectedTemplate?.facebookTemplateName) {
        // Send as approved template
        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'template',
            to: formattedNumber,
            templateName: selectedTemplate.facebookTemplateName,
            parameters: Object.values(variableValues).filter(v => v)
          }
        });

        if (error) {
          throw new Error((error as any).message || 'שגיאה בשליחת הודעת תבנית');
        }

        const status = (data as any)?.messageStatus || 'sent';
        toast.success(`ההודעה נשלחה ללקוח ${customer.full_name} (${status})`);
        onClose();
      } else {
        // No facebook_template_name - can't send via API
        toast.error("תבנית זו אינה מאושרת בפייסבוק. השתמש בלינק WhatsApp לשליחה ידנית");
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast.error(error?.message || "שגיאה בשליחת ההודעה");
    } finally {
      setIsSending(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "lead" | "car" | "custom");
    
    // Select first template of new type
    if (tab === "lead" && leadTemplates.length > 0) {
      setSelectedTemplateId(leadTemplates[0].id);
    } else if (tab === "car" && carTemplates.length > 0) {
      setSelectedTemplateId(carTemplates[0].id);
    } else if (tab === "custom") {
      setSelectedTemplateId("");
    }
  };

  const currentMessage = generateCustomerMessage();
  const currentTemplates = activeTab === "lead" ? leadTemplates : activeTab === "car" ? carTemplates : [];

  const ctaOptions = [
    { value: "לקבוע פגישה", label: "לקבוע פגישה" },
    { value: "לתאם צפייה", label: "לתאם צפייה" },
    { value: "לקבוע שיחה קצרה", label: "לקבוע שיחה קצרה" },
    { value: "להתייעץ", label: "להתייעץ" },
    { value: "לקבל הצעת מחיר", label: "לקבל הצעת מחיר" },
    { value: "custom", label: "טקסט מותאם אישית" },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Template Type Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="lead" className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            לקוחות ({leadTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="car" className="flex items-center gap-2 text-sm">
            <CarIcon className="h-4 w-4" />
            רכבים ({carTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-sm">
            הודעה מותאמת
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lead" className="space-y-4 mt-4">
          {leadTemplates.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>לא נמצאו תבניות לקוחות</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-right text-sm">בחר תבנית</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue placeholder="בחר תבנית" />
                </SelectTrigger>
                <SelectContent align="end" className="max-h-[300px] overflow-y-auto bg-background z-[9999]" dir="rtl">
                  {leadTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id} className="text-right cursor-pointer pl-8 pr-2 flex-row-reverse">
                      <div className="flex flex-col items-end w-full">
                        <span className="font-medium">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="car" className="space-y-4 mt-4">
          {carTemplates.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>לא נמצאו תבניות רכבים</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-right text-sm">בחר תבנית</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue placeholder="בחר תבנית" />
                </SelectTrigger>
                <SelectContent align="end" className="max-h-[300px] overflow-y-auto bg-background z-[9999]" dir="rtl">
                  {carTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id} className="text-right cursor-pointer pl-8 pr-2 flex-row-reverse">
                      <div className="flex flex-col items-end w-full">
                        <span className="font-medium">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="customMessage">הודעה מותאמת אישית</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={8}
              className="text-right resize-none"
              dir="rtl"
              placeholder="כתוב כאן את ההודעה המותאמת אישית..."
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dynamic Variable Inputs */}
      {activeTab !== "custom" && selectedTemplate && templateVariables.length > 0 && (
        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <Label className="text-right text-sm block">ערכי משתנים</Label>
          <div className="grid gap-3">
            {templateVariables.map((variable: string) => (
              variable === 'CTA' ? (
                <div key={variable} className="space-y-2">
                  <Label htmlFor={variable} className="text-right text-sm">קריאה לפעולה (CTA)</Label>
                  <Select 
                    value={selectedCta} 
                    onValueChange={(value) => {
                      setSelectedCta(value);
                      if (value !== 'custom') {
                        setVariableValues(prev => ({ ...prev, CTA: value }));
                      }
                    }}
                  >
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue placeholder="בחר קריאה לפעולה" />
                    </SelectTrigger>
                    <SelectContent align="end" dir="rtl" className="bg-background z-[9999]">
                      {ctaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-right pl-8 pr-2 flex-row-reverse">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCta === "custom" && (
                    <Input
                      placeholder="הזן קריאה לפעולה מותאמת אישית"
                      value={customCta}
                      onChange={(e) => {
                        setCustomCta(e.target.value);
                        setVariableValues(prev => ({ ...prev, CTA: e.target.value }));
                      }}
                      className="text-right"
                    />
                  )}
                </div>
              ) : (
                <div key={variable}>
                  <Label htmlFor={variable} className="text-right text-sm">{variable}</Label>
                  <Input
                    id={variable}
                    value={variableValues[variable] || ''}
                    onChange={(e) => setVariableValues(prev => ({ ...prev, [variable]: e.target.value }))}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {currentMessage && (
        <div className="space-y-2">
          <Label>תצוגה מקדימה</Label>
          <WhatsappTemplatePreview template={currentMessage} />
        </div>
      )}

      {/* Warning for non-approved templates */}
      {!hasApprovedTemplate() && currentMessage.trim() && (
        <NonDefaultTemplateWarning 
          phoneNumber={customer.phone || ''} 
          message={currentMessage} 
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          ביטול
        </Button>
        
        {hasApprovedTemplate() ? (
          <Button 
            onClick={handleSend} 
            disabled={isSending || !customer.phone || !currentMessage.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 ml-2" />
            {isSending ? "שולח..." : "שלח בוואטסאפ"}
          </Button>
        ) : (
          <Button 
            asChild
            disabled={!customer.phone || !currentMessage.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <a 
              href={generateWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={onClose}
            >
              <ExternalLink className="h-4 w-4 ml-2" />
              פתח בוואטסאפ
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
