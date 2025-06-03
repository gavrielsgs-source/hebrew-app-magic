
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { whatsappLeadTemplates } from "./lead-templates";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface WhatsappLeadTemplateSelectorProps {
  leadName: string;
  leadPhone: string;
  leadSource?: string;
  onClose: () => void;
}

export function WhatsappLeadTemplateSelector({ 
  leadName, 
  leadPhone, 
  leadSource,
  onClose 
}: WhatsappLeadTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappLeadTemplates[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const isMobile = useIsMobile();

  const generateMessage = () => {
    if (activeTab === "custom" && customMessage.trim()) {
      return customMessage;
    }
    
    return selectedTemplate.generateMessage(leadName, leadSource);
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

  const handleSendMessage = () => {
    const message = generateMessage();
    
    if (!message.trim()) {
      toast.error("אנא כתב הודעה לפני השליחה");
      return;
    }

    const formattedPhone = formatPhoneForWhatsApp(leadPhone);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success(`נפתח וואטסאפ עם ההודעה ל${leadName}`);
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
        <TabsList className={`w-full ${isMobile ? 'h-auto grid-cols-2 text-xs' : 'grid grid-cols-2'}`}>
          <TabsTrigger value="templates" className={isMobile ? "text-xs" : ""}>תבניות</TabsTrigger>
          <TabsTrigger value="custom" className={isMobile ? "text-xs" : ""}>הודעה מותאמת</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          <div className="grid gap-3">
            {whatsappLeadTemplates.filter(t => t.id !== 'custom').map((template) => (
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
