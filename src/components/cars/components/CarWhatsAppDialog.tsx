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
  const { leads } = useLeads();
  const { profile } = useProfile();

  // Generate message based on template and car details
  const generateCarMessage = () => {
    const clientName = activeTab === "lead" 
      ? (leads?.find(lead => lead.id === selectedLeadId)?.name as string || "לקוח יקר")
      : manualName || "לקוח יקר";

    if (selectedTemplateId === "custom") {
      return customMessage;
    }

    const template = whatsappTemplates.find(t => t.id === selectedTemplateId);
    if (!template) return "";

    // Prepare car object with the correct property names
    const carForTemplate = {
      ...car,
      mileage: car.kilometers // Map kilometers to mileage for template compatibility
    };

    // Generate message using template function
    let message = template.generateMessage(carForTemplate);
    
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

    const formattedNumber = formatPhoneNumber(phoneNumber);
    const userPhone = profile?.phone || '0000000000';
    
    try {
      if (selectedTemplateId === 'car_template_default') {
        // Send default car_template via WhatsApp API
        // For now, we don't send image_url as car type doesn't have images field
        // You can add this later when car images are properly stored
        
        const { error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            type: 'template',
            to: formattedNumber,
            templateName: 'car_template',
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
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="text-right">
            <SelectValue placeholder="בחר תבנית" />
          </SelectTrigger>
          <SelectContent align="end">
            {whatsappTemplates.map(template => (
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