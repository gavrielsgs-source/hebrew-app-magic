import { useState, useEffect } from "react";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWhatsappTemplates } from "@/hooks/whatsapp/use-whatsapp-templates";
import { getCarImages } from "@/lib/image-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Car } from "@/types/car";
import { WhatsappPhoneInput } from "@/components/whatsapp/components/WhatsappPhoneInput";
import { WhatsappLeadSelector } from "@/components/whatsapp/components/WhatsappLeadSelector";
import { ManualPhoneInput } from "@/components/whatsapp/components/ManualPhoneInput";
import { SelectedCarDetails } from "@/components/whatsapp/components/SelectedCarDetails";
import { WhatsappDialogHeader } from "@/components/whatsapp/components/WhatsappDialogHeader";
import { ImageWarning } from "@/components/whatsapp/components/ImageWarning";

interface CarWhatsAppDialogProps {
  car: Car;
  onClose: () => void;
}

export function CarWhatsAppDialog({ car, onClose }: CarWhatsAppDialogProps) {
  const { data: templates = [] } = useWhatsappTemplates('car');
  const [activeTab, setActiveTab] = useState<'lead' | 'manual'>('lead');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [manualName, setManualName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [carImages, setCarImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      const images = await getCarImages(car.id);
      setCarImages(images);
    };
    loadImages();
  }, [car.id]);

  const generateCarMessage = () => {
    if (customMessage) {
      return customMessage;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template || !template.generateMessage) return "";

    return template.generateMessage(car);
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
      if (selectedTemplateId === 'car_template_default') {
        // בדיקה שקיימת תמונה לרכב
        if (!carImageUrl) {
          toast.error("לא ניתן לשלוח תבנית דפולטיבית ללא תמונת רכב");
          return;
        }

        const { error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'template',
            to: formattedNumber,
            templateName: 'car_template',
            imageUrl: carImageUrl, // שליחת תמונה בheader של התבנית
            parameters: [
              car.model, // {{1}}
              car.year.toString(), // {{2}}
              car.price.toLocaleString(), // {{3}}
              car.fuel_type || 'לא צוין', // {{4}}
              car.kilometers.toLocaleString(), // {{5}}
              car.transmission || 'לא צוין', // {{6}}
              userPhone // {{7}} - מספר טלפון של המשתמש
            ]
          }
        });

        if (error) {
          throw error;
        }
      } else {
        // Send custom template or generated message as text
        const messageText = selectedTemplateId === "custom" 
          ? customMessage 
          : generateCarMessage();

        const { error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'text',
            to: formattedNumber,
            message: messageText
          }
        });

        if (error) {
          throw error;
        }
      }

      toast.success("ההודעה נשלחה בוואטסאפ");
      onClose();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast.error("שגיאה בשליחת ההודעה");
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
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="text-right">
            <SelectValue placeholder="בחר תבנית" />
          </SelectTrigger>
          <SelectContent align="end">
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} - {template.description || ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            value={whatsappTemplates.find(t => t.id === "car_template_default")?.templateContent || ''}
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
          disabled={!phoneNumber || !currentMessage.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Send className="w-4 h-4 ml-2" />
          שלח בוואטסאפ
        </Button>
      </div>
    </div>
  );
}