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
import { Send, Car as CarIcon, Phone, User } from "lucide-react";
import { whatsappTemplates } from "@/components/whatsapp/whatsapp-templates";
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [manualName, setManualName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("car_template_default");
  const [customMessage, setCustomMessage] = useState("");
  const [carImageUrl, setCarImageUrl] = useState<string | undefined>();
  const [templates, setTemplates] = useState<any[]>(whatsappTemplates);
  const [isSending, setIsSending] = useState(false);
  const [selectedCta, setSelectedCta] = useState("לקבוע פגישה");
  const [customCta, setCustomCta] = useState("");
  const { leads } = useLeads();
  const { profile } = useProfile();
  const { data: dbTemplates } = useWhatsappTemplates();

  // Merge templates from database with default templates
  useEffect(() => {
    const carDbTemplates = dbTemplates?.filter(t => t.type === 'car') || [];
    
    // Start with all default templates
    const mergedTemplates = [...whatsappTemplates];
    
    // Override or add DB templates
    carDbTemplates.forEach(dbTemplate => {
      const existingIndex = mergedTemplates.findIndex(t => t.id === dbTemplate.id);
      const convertedTemplate = {
        id: dbTemplate.id,
        name: dbTemplate.name,
        description: dbTemplate.description || '',
        type: 'car' as const,
        usesCta: dbTemplate.template_content.includes('{{CTA}}'),
        templateContent: dbTemplate.template_content,
        facebookTemplateName: dbTemplate.facebook_template_name,
        generateMessage: (carName: string, car: any) => {
          return dbTemplate.template_content
            .replace(/\{carName\}/g, carName)
            .replace(/\{price\}/g, car.price?.toLocaleString() || '')
            .replace(/\{kilometers\}/g, car.kilometers?.toLocaleString() || '')
            .replace(/\{mileage\}/g, car.kilometers?.toLocaleString() || '');
        }
      };
      
      if (existingIndex >= 0) {
        mergedTemplates[existingIndex] = convertedTemplate;
      } else {
        mergedTemplates.push(convertedTemplate);
      }
    });
    
    setTemplates(mergedTemplates);
  }, [dbTemplates]);

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

  // Generate message based on template and car details
  const generateCarMessage = () => {
    const clientName = activeTab === "lead" 
      ? (leads?.find(lead => lead.id === selectedLeadId)?.name as string || "לקוח יקר")
      : manualName || "לקוח יקר";

    if (selectedTemplateId === "custom") {
      return customMessage;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return "";

    // Prepare car object with the correct property names
    const carForTemplate = {
      ...car,
      mileage: car.kilometers // Map kilometers to mileage for template compatibility
    };

    // Generate message using template function with CTA only if template uses it
    const currentCta = template.usesCta ? (selectedCta === "custom" ? customCta : selectedCta) : undefined;
    const carName = `${car.make} ${car.model} ${car.year}`;
    let message = template.generateMessage(carName, carForTemplate, currentCta);
    
    // Replace client name placeholder if exists
    message = message.replace(/שלום[!]?/, `שלום ${clientName}!`);

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

      if (selectedTemplateId === 'car_template_default') {
        // בדיקה שקיימת תמונה לרכב
        if (!carImageUrl) {
          toast.error("לא ניתן לשלוח תבנית דפולטיבית ללא תמונת רכב");
          return;
        }

        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'template',
            to: formattedNumber,
            templateName: 'car_template',
            imageUrl: carImageUrl,
            parameters: [
              `${car.make} ${car.model} ${car.year}`,
              car.price.toLocaleString(),
              car.fuel_type || 'לא צוין',
              car.kilometers.toLocaleString(),
              car.transmission || 'לא צוין',
              userPhone
            ]
          }
        });

        if (error) {
          throw new Error((error as any).message || 'שגיאה בשליחת הודעת תבנית');
        }

        const status = (data as any)?.messageStatus || 'sent';
        toast.success(`ההודעה נשלחה (${status})`);
        onClose();
      } else {
        // הודעת טקסט רגילה
        const messageText = selectedTemplateId === "custom" 
          ? customMessage 
          : generateCarMessage();

        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'text',
            to: formattedNumber,
            message: messageText
          }
        });

        if (error) {
          throw new Error((error as any).message || 'שגיאה בשליחת הודעת טקסט');
        }

        const status = (data as any)?.messageStatus || 'sent';
        toast.success(`ההודעה נשלחה (${status})`);
        onClose();
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

      {/* Template Selection */}
      <div>
        <Label className="text-right text-sm mb-2 block">בחר תבנית הודעה</Label>
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="text-right">
            <SelectValue placeholder="בחר תבנית" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="car_template_default">תבנית וואטסאפ מאושרת (עם תמונה)</SelectItem>
            {templates.map(template => (
              <SelectItem 
                key={template.id} 
                value={template.id}
                disabled={template.id === "car_template_default"}
              >
                {template.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">הודעה מותאמת אישית</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CTA Selection */}
      {selectedTemplateId !== "custom" && selectedTemplateId !== "car_template_default" && (
        (() => {
          const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
          return selectedTemplate?.usesCta ? (
            <div className="space-y-2">
              <Label htmlFor="cta" className="text-right text-sm">קריאה לפעולה (CTA)</Label>
              <Select value={selectedCta} onValueChange={setSelectedCta}>
                <SelectTrigger id="cta" className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 text-right">
                  <SelectValue placeholder="בחר קריאה לפעולה" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-primary/20 z-[100]">
                  <SelectItem value="לקבוע פגישה">לקבוע פגישה</SelectItem>
                  <SelectItem value="לתאם צפייה">לתאם צפייה</SelectItem>
                  <SelectItem value="לקבוע שיחה קצרה">לקבוע שיחה קצרה</SelectItem>
                  <SelectItem value="להתייעץ">להתייעץ</SelectItem>
                  <SelectItem value="לקבל הצעת מחיר">לקבל הצעת מחיר</SelectItem>
                  <SelectItem value="custom">טקסט מותאם אישית</SelectItem>
                </SelectContent>
              </Select>
              {selectedCta === "custom" && (
                <Input
                  placeholder="הזן קריאה לפעולה מותאמת אישית"
                  value={customCta}
                  onChange={(e) => setCustomCta(e.target.value)}
                  className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 text-right"
                />
              )}
            </div>
          ) : null;
        })()
      )}

      {/* Custom Message Input or Default Template Display */}
      {selectedTemplateId === "custom" && (
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
      
      {selectedTemplateId === "car_template_default" && (
        <div>
          <Label className="text-right text-sm">תבנית דפולטיבית (לא ניתנת לעריכה)</Label>
          <Textarea
            value={`שלום! 👋

הודעת תבנית מאושרת תישלח עם תמונת הרכב:

🚗 ${car.make} ${car.model} ${car.year}
💰 מחיר: ₪${car.price.toLocaleString()}
📏 קילומטר: ${car.kilometers.toLocaleString()} ק"מ
⛽ ${car.fuel_type || 'לא צוין'} | 🔧 ${car.transmission || 'לא צוין'}

ליצירת קשר: ${profile?.phone || ''}`}
            disabled
            rows={8}
            className="text-right resize-none opacity-60 cursor-not-allowed bg-muted"
            dir="rtl"
          />
        </div>
      )}

      {/* Message Preview */}
      {selectedTemplateId !== "car_template_default" && (
        <div>
          <Label className="text-right text-sm mb-2 block">תצוגה מקדימה של ההודעה</Label>
          <div className="bg-muted/50 p-3 rounded-lg border max-h-48 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap text-right" dir="rtl">
              {currentMessage || "בחר תבנית או כתוב הודעה מותאמת"}
            </pre>
          </div>
        </div>
      )}
      
      {selectedTemplateId === "car_template_default" && (
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-sm text-muted-foreground text-right">
            ההודעה תישלח בתבנית דפולטיבית של WhatsApp Business עם תמונת הרכב
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          ביטול
        </Button>
        <Button 
          onClick={handleSend}
          disabled={isSending || !phoneNumber}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Send className="w-4 h-4 ml-2" />
          {isSending ? "שולח..." : "שלח בוואטסאפ"}
        </Button>
      </div>
    </div>
  );
}