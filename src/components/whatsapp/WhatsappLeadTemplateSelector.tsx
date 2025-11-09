import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { useUpdateLead } from "@/hooks/leads/use-update-lead";
import { useWhatsappTemplates } from "@/hooks/whatsapp/use-whatsapp-templates";
import { toast } from "sonner";

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
  const { data: leadTemplatesData = [] } = useWhatsappTemplates('lead');
  const { data: carTemplatesData = [] } = useWhatsappTemplates('car');
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [activeTab, setActiveTab] = useState("lead");
  const updateLead = useUpdateLead();

  const generateMessage = () => {
    if (activeTab === 'custom') {
      return customMessage;
    }

    const templates = activeTab === 'lead' ? leadTemplatesData : carTemplatesData;
    const template = templates.find(t => t.id === selectedTemplate);
    
    if (!template || !template.generateMessage) return "";

    return template.generateMessage({
      leadName: leadName || 'לקוח',
      leadSource: leadSource || 'לא צוין',
      leadPhone: leadPhone || '',
    });
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
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="font-semibold mb-2 text-right text-xl">
          שליחת הודעה ל{leadName}
        </h2>
        <p className="text-muted-foreground text-right">
          בחר תבנית הודעה מתאימה להתחלת שיחה
        </p>
        {leadSource && (
          <p className="text-primary text-right text-sm mt-1">
            מקור הליד: {leadSource}
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="lead">
            תבניות לידים ({leadTemplatesData.length})
          </TabsTrigger>
          <TabsTrigger value="car">
            תבניות רכבים ({carTemplatesData.length})
          </TabsTrigger>
          <TabsTrigger value="custom">הודעה מותאמת</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lead" className="space-y-4">
          <div className="space-y-2">
            {leadTemplatesData.map((template) => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTemplate === template.id && activeTab === 'lead'
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
                onClick={() => {
                  setSelectedTemplate(template.id);
                }}
              >
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="car" className="space-y-4">
          <div className="space-y-2">
            {carTemplatesData.map((template) => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTemplate === template.id && activeTab === 'car'
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
                onClick={() => {
                  setSelectedTemplate(template.id);
                }}
              >
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
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

      <div className="flex gap-3">
        <Button 
          onClick={handleSendMessage}
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
          disabled={!message.trim()}
        >
          שלח בוואטסאפ ל{leadName}
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          ביטול
        </Button>
      </div>
    </div>
  );
}
