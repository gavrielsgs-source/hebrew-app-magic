
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
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface WhatsappTemplateSelectorProps {
  car: Car;
  onClose: () => void;
}

export function WhatsappTemplateSelector({ car, onClose }: WhatsappTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedLeadName, setSelectedLeadName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const isMobile = useIsMobile();

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
    toast.success(`נפתח וואטסאפ עם ההודעה${selectedLeadName ? ` ל${selectedLeadName}` : ''}`);
    onClose();
  };

  const handleLeadSelect = (leadId: string, phone: string, name: string) => {
    setSelectedPhone(phone);
    setSelectedLeadName(name);
    console.log("Lead selected:", { leadId, phone, name });
  };

  const handleNewLead = () => {
    // Switch to manual tab when a new lead is added
    setActiveTab("manual");
    console.log("New lead added, switching to manual tab");
  };

  const message = generateMessage();

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`} dir="rtl">
      <div>
        <h2 className={`font-semibold mb-2 text-right ${isMobile ? 'text-lg' : 'text-xl'}`}>שליחת פרטי רכב בוואטסאפ</h2>
        <p className={`text-gray-600 text-right ${isMobile ? 'text-sm' : ''}`}>בחר תבנית הודעה ולקוח לשליחה</p>
      </div>

      <SelectedCarDetails car={car} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className={`w-full ${isMobile ? 'h-auto grid-cols-3 text-xs' : 'grid grid-cols-3'}`}>
          <TabsTrigger value="templates" className={isMobile ? "text-xs" : ""}>תבניות</TabsTrigger>
          <TabsTrigger value="leads" className={isMobile ? "text-xs" : ""}>לקוחות</TabsTrigger>
          <TabsTrigger value="manual" className={isMobile ? "text-xs" : ""}>ידנית</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          <div className="grid gap-3">
            {whatsappTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg cursor-pointer transition-colors ${
                  isMobile ? 'p-3' : 'p-4'
                } ${
                  selectedTemplate.id === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <h3 className={`font-medium text-right ${isMobile ? 'text-sm' : ''}`}>{template.name}</h3>
                <p className={`text-gray-600 text-right mt-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>{template.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="leads" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          <WhatsappLeadSelector 
            onLeadSelect={handleLeadSelect}
            onNewLead={handleNewLead}
            selectedLeadId=""
          />
          
          {selectedPhone && (
            <div className="mt-4">
              <WhatsappPhoneInput
                phoneNumber={selectedPhone}
                setPhoneNumber={setSelectedPhone}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          <ManualPhoneInput
            onSendMessage={handleSendMessage}
            defaultMessage={message}
          />
        </TabsContent>
      </Tabs>

      {(selectedPhone || activeTab === "manual") && activeTab !== "manual" && (
        <>
          <WhatsappTemplatePreview
            template={message}
          />

          <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
            <Button 
              onClick={() => handleSendMessage(selectedPhone, message)}
              className={`bg-green-600 hover:bg-green-700 text-white ${
                isMobile ? 'flex-1 order-1' : 'flex-1'
              }`}
            >
              שלח בוואטסאפ{selectedLeadName && ` ל${selectedLeadName}`}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className={isMobile ? 'order-2' : ''}
            >
              ביטול
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
