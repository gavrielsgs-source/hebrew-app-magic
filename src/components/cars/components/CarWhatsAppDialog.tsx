import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import { Car } from "@/types/car";
import { Send, Car as CarIcon, Phone, User, ExternalLink } from "lucide-react";
import { NonDefaultTemplateWarning } from "@/components/whatsapp/NonDefaultTemplateWarning";

import { formatPhoneForWhatsApp } from "@/utils/phone-utils";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { getCarImages } from "@/lib/image-utils";
import { useWhatsappTemplates } from "@/hooks/whatsapp-templates";


interface CarWhatsAppDialogProps {
  car: Car;
  onClose: () => void;
}

export function CarWhatsAppDialog({ car, onClose }: CarWhatsAppDialogProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [templateType, setTemplateType] = useState<"car" | "lead" | "custom">("car");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [manualName, setManualName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [carImageUrl, setCarImageUrl] = useState<string | undefined>();
  const [carTemplates, setCarTemplates] = useState<any[]>([]);
  const [leadTemplates, setLeadTemplates] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const { leads } = useLeads();
  const { profile } = useProfile();
  const { data: dbTemplates } = useWhatsappTemplates();

  // Use DB templates as source of truth
  useEffect(() => {
    const carDbTemplates = dbTemplates?.filter(t => t.type === 'car') || [];
    const leadDbTemplates = dbTemplates?.filter(t => t.type === 'lead') || [];
    
    const convertedCarTemplates = carDbTemplates.map(dbTemplate => ({
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description || '',
      type: 'car' as const,
      templateContent: dbTemplate.template_content,
      facebookTemplateName: dbTemplate.facebook_template_name,
    }));

    const convertedLeadTemplates = leadDbTemplates.map(dbTemplate => ({
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description || '',
      type: 'lead' as const,
      templateContent: dbTemplate.template_content,
      facebookTemplateName: dbTemplate.facebook_template_name,
    }));
    
    setCarTemplates(convertedCarTemplates);
    setLeadTemplates(convertedLeadTemplates);
    
    // Set default template - prefer car_template (the approved one)
    if (convertedCarTemplates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = convertedCarTemplates.find(t => t.facebookTemplateName === 'car_template');
      setSelectedTemplateId(defaultTemplate?.id || convertedCarTemplates[0].id);
    }
  }, [dbTemplates]);

  // Get current templates based on template type
  const currentTemplates = templateType === "car" ? carTemplates : templateType === "lead" ? leadTemplates : [];

  // Extract variables from selected template and initialize values
  const selectedTemplate = currentTemplates.find(t => t.id === selectedTemplateId);
  const templateContent = selectedTemplate?.templateContent || '';
  const templateVariables = templateContent.match(/\{\{([^}]+)\}\}/g)?.map((v: string) => v.replace(/\{\{|\}\}/g, '')) || [];
  const hasCta = templateVariables.includes('CTA');

  // Variable labels for numbered parameters
  const getVariableLabel = (variable: string): string => {
    const labels: Record<string, string> = {
      '1': 'שם הרכב',
      '2': 'מחיר',
      '3': 'סוג דלק',
      '4': 'קילומטראז\'',
      '5': 'תיבת הילוכים',
      '6': 'טלפון ליצירת קשר',
      '7': 'קריאה לפעולה (CTA)',
      '8': 'חתימה',
      'clientName': 'שם הלקוח',
      'carName': 'שם הרכב',
      'price': 'מחיר',
      'kilometers': 'קילומטראז\'',
      'mileage': 'קילומטראז\'',
      'fuelType': 'סוג דלק',
      'transmission': 'תיבת הילוכים',
      'year': 'שנה',
      'color': 'צבע',
      'CTA': 'קריאה לפעולה (CTA)',
    };
    return labels[variable] || variable;
  };

  // Check if variable is a CTA field
  const isCtaVariable = (variable: string): boolean => {
    return variable === 'CTA' || variable === '7';
  };

  // Initialize variable values when template changes
  useEffect(() => {
    if (templateVariables.length > 0 && selectedTemplate) {
      const clientName = activeTab === "lead" 
        ? (leads?.find(lead => lead.id === selectedLeadId)?.name as string || "לקוח יקר")
        : (manualName || "לקוח יקר");
      
      const carName = `${car.make} ${car.model} ${car.year}`;
      const userPhone = profile?.phone || '';
      
      const initialValues: Record<string, string> = {};
      templateVariables.forEach((variable: string) => {
        // Keep existing value if already set, otherwise use default
        const existingValue = variableValues[variable];
        
        // Numbered parameters for car_template
        if (variable === '1') {
          initialValues[variable] = existingValue || carName;
        } else if (variable === '2') {
          initialValues[variable] = existingValue || car.price?.toLocaleString() || '';
        } else if (variable === '3') {
          initialValues[variable] = existingValue || (car.fuel_type || 'לא צוין');
        } else if (variable === '4') {
          initialValues[variable] = existingValue || car.kilometers?.toLocaleString() || '';
        } else if (variable === '5') {
          initialValues[variable] = existingValue || (car.transmission || 'לא צוין');
        } else if (variable === '6') {
          initialValues[variable] = existingValue || userPhone;
        } else if (variable === '7') {
          initialValues[variable] = existingValue || 'לקבוע פגישה';
        } else if (variable === '8') {
          initialValues[variable] = existingValue || 'צוות המכירות';
        }
        // Named parameters
        else if (variable === 'clientName') {
          initialValues[variable] = existingValue || clientName;
        } else if (variable === 'carName') {
          initialValues[variable] = existingValue || carName;
        } else if (variable === 'price') {
          initialValues[variable] = existingValue || `₪${car.price?.toLocaleString()}`;
        } else if (variable === 'kilometers' || variable === 'mileage') {
          initialValues[variable] = existingValue || `${car.kilometers?.toLocaleString()} ק"מ`;
        } else if (variable === 'fuelType') {
          initialValues[variable] = existingValue || (car.fuel_type || 'לא צוין');
        } else if (variable === 'transmission') {
          initialValues[variable] = existingValue || (car.transmission || 'לא צוין');
        } else if (variable === 'year') {
          initialValues[variable] = existingValue || String(car.year);
        } else if (variable === 'color') {
          initialValues[variable] = existingValue || (car.exterior_color || 'לא צוין');
        } else if (variable === 'CTA') {
          initialValues[variable] = existingValue || "לקבוע פגישה";
        } else {
          initialValues[variable] = existingValue || '';
        }
      });
      setVariableValues(initialValues);
    }
  }, [selectedTemplateId, currentTemplates, activeTab, selectedLeadId, manualName, profile?.phone]);
  // Load car image on mount
  useEffect(() => {
    const loadCarImage = async () => {
      try {
        const images = await getCarImages(car.id);
        if (images && images.length > 0) {
          setCarImageUrl(images[0]);
        }
      } catch (error) {
        console.error("Error loading car image:", error);
      }
    };
    loadCarImage();
  }, [car.id]);

  // Generate message based on template and variable values
  const generateCarMessage = () => {
    if (templateType === "custom" || selectedTemplateId === "custom") {
      return customMessage;
    }

    if (!selectedTemplate || !templateContent) return "";

    let message = templateContent;
    Object.entries(variableValues).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    return message;
  };

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => (lead.id as string) === leadId);
    if (selectedLead) {
      setSelectedLeadId(leadId);
      setPhoneNumber((selectedLead.phone as string) || "");
    }
  };

  const formatPhoneNumber = (phone: string) => {
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

  // Check if template has facebook_template_name
  const hasApprovedTemplate = () => {
    if (templateType === "custom" || selectedTemplateId === "custom") return false;
    return !!selectedTemplate?.facebookTemplateName;
  };

  // Generate WhatsApp link for free text messages
  const generateWhatsAppLink = () => {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const message = encodeURIComponent(generateCarMessage());
    return `https://wa.me/${formattedNumber}?text=${message}`;
  };

  const handleSend = async () => {
    if (!phoneNumber) {
      toast.error("יש להזין מספר טלפון או לבחור לקוח");
      return;
    }

    // בדיקה שיש מספר טלפון של המשתמש
    if (!profile?.phone) {
      toast.error("חסר מספר טלפון בפרופיל שלך. אנא עדכן את הפרופיל לפני שליחת הודעה");
      return;
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    const userPhone = profile.phone;
    
    try {
      setIsSending(true);

      if (selectedTemplate?.facebookTemplateName === 'car_template') {
        // תבנית רכב מאושרת - שליחה עם תמונה (התבנית בפייסבוק דורשת הדר עם תמונה ו-8 פרמטרים)
        if (!carImageUrl) {
          toast.error("לא ניתן לשלוח תבנית רכב ללא תמונה");
          return;
        }
        
        // Build parameters in correct order (1-7)
        const parameters = [
          variableValues['1'] || `${car.make} ${car.model} ${car.year}`,
          variableValues['2'] || car.price.toLocaleString(),
          variableValues['3'] || car.fuel_type || 'לא צוין',
          variableValues['4'] || car.kilometers.toLocaleString(),
          variableValues['5'] || car.transmission || 'לא צוין',
          variableValues['6'] || userPhone,
          variableValues['7'] || 'לקבוע פגישה'
        ];

        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'template',
            to: formattedNumber,
            templateName: 'car_template',
            imageUrl: carImageUrl,
            parameters
          }
        });

        if (error) {
          throw new Error((error as any).message || 'שגיאה בשליחת הודעת תבנית');
        }

        const status = (data as any)?.messageStatus || 'sent';
        toast.success(`ההודעה נשלחה (${status})`);
        onClose();
      } else if (selectedTemplate?.facebookTemplateName) {
        // שליחה כתבנית מאושרת
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
        toast.success(`ההודעה נשלחה (${status})`);
        onClose();
      } else {
        // אין facebook_template_name - לא ניתן לשלוח דרך API
        toast.error("תבנית זו אינה מאושרת בפייסבוק. השתמש בלינק WhatsApp לשליחה ידנית");
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast.error(error?.message || "שגיאה בשליחת ההודעה");
    } finally {
      setIsSending(false);
    }
  };

  const currentMessage = generateCarMessage();

  return (
    <div className="space-y-4" dir="rtl">
      {/* Car Details Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <CarIcon className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-right">
              {car.make} {car.model} ({car.year})
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="text-right">מחיר: {car.price.toLocaleString()} ₪</div>
            <div className="text-right">ק"מ: {car.kilometers.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Recipient Selection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            הזנה ידנית
          </TabsTrigger>
          <TabsTrigger value="lead" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            בחר לקוח
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lead" className="space-y-3">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <Label className="text-right text-sm">בחר לקוח</Label>
              <Select value={selectedLeadId} onValueChange={handleLeadSelect}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent align="end">
                  {leads?.map(lead => (
                    <SelectItem key={lead.id as string} value={lead.id as string}>
                      {lead.name as string} {lead.phone ? `(${lead.phone as string})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-right text-sm">מספר טלפון</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05X-XXXXXXX"
                className="text-right"
                dir="ltr"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-3">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <Label className="text-right text-sm">שם הלקוח</Label>
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="שם הלקוח"
                className="text-right"
              />
            </div>
            
            <div>
              <Label className="text-right text-sm">מספר טלפון</Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05X-XXXXXXX"
                className="text-right"
                dir="ltr"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Type Tabs */}
      <Tabs value={templateType} onValueChange={(value) => {
        setTemplateType(value as "car" | "lead" | "custom");
        if (value === "car" && carTemplates.length > 0) {
          const defaultTemplate = carTemplates.find(t => t.facebookTemplateName === 'car_template');
          setSelectedTemplateId(defaultTemplate?.id || carTemplates[0].id);
        } else if (value === "lead" && leadTemplates.length > 0) {
          setSelectedTemplateId(leadTemplates[0].id);
        } else if (value === "custom") {
          setSelectedTemplateId("custom");
        }
      }} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="car" className="text-sm">
            רכבים ({carTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="lead" className="text-sm">
            לקוחות ({leadTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-sm">
            הודעה מותאמת
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Template Selection - only show for car and lead types */}
      {templateType !== "custom" && (
        <div>
          <Label className="text-right text-sm mb-2 block">בחר תבנית הודעה</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-full text-right" dir="rtl">
              <SelectValue placeholder="בחר תבנית" />
            </SelectTrigger>
            <SelectContent align="end" className="max-h-[300px] overflow-y-auto bg-background z-[9999]" dir="rtl">
              {currentTemplates.map(template => (
                <SelectItem 
                  key={template.id} 
                  value={template.id}
                  className="text-right cursor-pointer pl-8 pr-2 flex-row-reverse"
                >
                  <div className="flex flex-col items-end w-full">
                    <span className="font-medium">
                      {template.name}
                      {template.facebookTemplateName && (
                        <span className="text-xs text-green-600 mr-2">✓ מאושר</span>
                      )}
                    </span>
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

      {/* Dynamic Variable Inputs */}
      {templateType !== "custom" && templateVariables.length > 0 && (
        <div className="space-y-3">
          <Label className="text-right text-sm block">ערכי משתנים</Label>
          <div className="grid gap-3">
            {templateVariables.map((variable: string) => (
              isCtaVariable(variable) ? (
                <div key={variable} className="space-y-2">
                  <Label htmlFor={variable} className="text-right text-sm">{getVariableLabel(variable)}</Label>
                  <Select 
                    value={variableValues[variable] || "לקבוע פגישה"} 
                    onValueChange={(value) => setVariableValues(prev => ({ ...prev, [variable]: value }))}
                  >
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue placeholder="בחר קריאה לפעולה" />
                    </SelectTrigger>
                    <SelectContent align="end" dir="rtl" className="bg-background z-[9999]">
                      <SelectItem value="לקבוע פגישה" className="text-right pl-8 pr-2 flex-row-reverse">לקבוע פגישה</SelectItem>
                      <SelectItem value="לתאם צפייה" className="text-right pl-8 pr-2 flex-row-reverse">לתאם צפייה</SelectItem>
                      <SelectItem value="לקבוע שיחה קצרה" className="text-right pl-8 pr-2 flex-row-reverse">לקבוע שיחה קצרה</SelectItem>
                      <SelectItem value="להתייעץ" className="text-right pl-8 pr-2 flex-row-reverse">להתייעץ</SelectItem>
                      <SelectItem value="לקבל הצעת מחיר" className="text-right pl-8 pr-2 flex-row-reverse">לקבל הצעת מחיר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div key={variable}>
                  <Label htmlFor={variable} className="text-right text-sm">{getVariableLabel(variable)}</Label>
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

      {/* Custom Message Input */}
      {templateType === "custom" && (
        <div>
          <Label className="text-right text-sm">הודעה מותאמת אישית</Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={8}
            className="text-right resize-none"
            dir="rtl"
            placeholder="כתוב כאן את ההודעה המותאמת אישית..."
          />
        </div>
      )}
      
      {/* Message Preview */}
      {templateType !== "custom" && (
        <div>
          <Label className="text-right text-sm mb-2 block">תצוגה מקדימה של ההודעה</Label>
          <div className="bg-muted/50 p-3 rounded-lg border max-h-48 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap text-right" dir="rtl">
              {currentMessage || "בחר תבנית"}
            </pre>
          </div>
          {selectedTemplate?.facebookTemplateName === 'car_template' && (
            <p className="text-xs text-green-600 mt-2 text-right">
              ✓ תבנית מאושרת - תישלח עם תמונת הרכב
            </p>
          )}
        </div>
      )}

      {/* Warning for non-approved templates */}
      {!hasApprovedTemplate() && currentMessage.trim() && (
        <NonDefaultTemplateWarning 
          phoneNumber={phoneNumber} 
          message={currentMessage} 
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          ביטול
        </Button>
        
        {hasApprovedTemplate() ? (
          <Button 
            onClick={handleSend}
            disabled={isSending || !phoneNumber}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 ml-2" />
            {isSending ? "שולח..." : "שלח בוואטסאפ"}
          </Button>
        ) : (
          <Button 
            asChild
            disabled={!phoneNumber || !currentMessage}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <a 
              href={generateWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={onClose}
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              פתח בוואטסאפ
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}