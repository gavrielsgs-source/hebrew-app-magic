
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car } from "@/types/car";
import { WhatsappLeadSelector } from "./components/WhatsappLeadSelector";
import { WhatsappPhoneInput } from "./components/WhatsappPhoneInput";
import { ManualPhoneInput } from "./components/ManualPhoneInput";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { SelectedCarDetails } from "./components/SelectedCarDetails";
import { whatsappTemplates } from "./whatsapp-templates";
import { toast } from "sonner";

interface WhatsappTemplateSelectorProps {
  car: Car;
  onClose: () => void;
}

export function WhatsappTemplateSelector({ car, onClose }: WhatsappTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const generateMessage = () => {
    if (customMessage.trim()) {
      return customMessage;
    }
    
    return selectedTemplate.generateMessage(car);
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

  const handleSendMessage = (phone: string, message: string) => {
    if (!phone || !message) {
      toast.error("אנא בחר מספר טלפון והודעה");
      return;
    }

    const formattedPhone = formatPhoneForWhatsApp(phone);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("נפתח וואטסאפ עם ההודעה");
    onClose();
  };

  const message = generateMessage();

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-xl font-semibold mb-2">שליחת פרטי רכב בוואטסאפ</h2>
        <p className="text-gray-600">בחר תבנית הודעה ולקוח לשליחה</p>
      </div>

      <SelectedCarDetails car={car} />

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">תבניות</TabsTrigger>
          <TabsTrigger value="leads">לקוחות</TabsTrigger>
          <TabsTrigger value="manual">הקלדה ידנית</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-3">
            {whatsappTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate.id === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <h3 className="font-medium text-right">{template.name}</h3>
                <p className="text-sm text-gray-600 text-right mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="leads" className="space-y-4">
          <WhatsappLeadSelector onPhoneSelect={setSelectedPhone} />
          
          {selectedPhone && (
            <div className="mt-4">
              <WhatsappPhoneInput
                phone={selectedPhone}
                onPhoneChange={setSelectedPhone}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <ManualPhoneInput
            onSendMessage={handleSendMessage}
            defaultMessage={message}
          />
        </TabsContent>
      </Tabs>

      {(selectedPhone || false) && (
        <>
          <WhatsappTemplatePreview
            template={selectedTemplate}
            car={car}
            customMessage={customMessage}
            onCustomMessageChange={setCustomMessage}
          />

          <div className="flex gap-3">
            <Button 
              onClick={() => handleSendMessage(selectedPhone, message)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              שלח בוואטסאפ
            </Button>
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
