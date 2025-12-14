import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { whatsappLeadTemplates } from "@/components/whatsapp/lead-templates";
import { formatPhoneForWhatsApp } from "@/utils/phone-utils";
import { supabase } from "@/integrations/supabase/client";
import { WhatsappTemplatePreview } from "@/components/whatsapp/WhatsappTemplatePreview";
import { NonDefaultTemplateWarning } from "@/components/whatsapp/NonDefaultTemplateWarning";
import { useWhatsappTemplates } from "@/hooks/whatsapp-templates";
import type { Customer } from "@/types/customer";

interface WhatsAppCustomerDialogProps {
  customer: Customer;
  onClose: () => void;
}

export function WhatsAppCustomerDialog({ customer, onClose }: WhatsAppCustomerDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(whatsappLeadTemplates[0]?.id || "");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedCta, setSelectedCta] = useState("לקבוע פגישה");
  const [customCta, setCustomCta] = useState("");
  const [carDetails, setCarDetails] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { data: dbTemplates } = useWhatsappTemplates();

  // Check if the selected template is default
  const isSelectedTemplateDefault = () => {
    if (selectedTemplateId === "custom") return true; // Custom messages don't need warning
    
    // Check if it's a DB template and if it's default
    const dbTemplate = dbTemplates?.find(t => 
      t.name === whatsappLeadTemplates.find(lt => lt.id === selectedTemplateId)?.name
    );
    return dbTemplate?.is_default ?? false;
  };

  // Get current CTA
  const getCurrentCta = () => {
    return selectedCta === "custom" ? customCta : selectedCta;
  };

  // Get selected template
  const selectedTemplate = whatsappLeadTemplates.find(t => t.id === selectedTemplateId);

  // Generate message based on template
  const generateCustomerMessage = () => {
    if (selectedTemplateId === "custom") {
      return customMessage;
    }

    const template = whatsappLeadTemplates.find(t => t.id === selectedTemplateId);
    if (!template) return "";

    const currentCta = template.usesCta ? getCurrentCta() : undefined;
    return template.generateMessage(customer.full_name, carDetails, currentCta);
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
      toast.success(`ההודעה נשלחה ללקוח ${customer.full_name} (${status})`);
      onClose();
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast.error(error?.message || "שגיאה בשליחת ההודעה");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-2">
        <Label htmlFor="template">בחר תבנית הודעה</Label>
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger id="template" className="text-right">
            <SelectValue placeholder="בחר תבנית" />
          </SelectTrigger>
          <SelectContent align="end">
            {whatsappLeadTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">הודעה מותאמת אישית</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Car Details Input (optional) */}
      {selectedTemplateId !== "custom" && selectedTemplateId === "follow_up_car" && (
        <div className="space-y-2">
          <Label htmlFor="carDetails">פרטי רכב (אופציונלי)</Label>
          <Input
            id="carDetails"
            placeholder="לדוגמה: טויוטה קורולה 2020"
            value={carDetails}
            onChange={(e) => setCarDetails(e.target.value)}
            className="text-right"
          />
        </div>
      )}

      {/* CTA Selection */}
      {selectedTemplateId !== "custom" && selectedTemplate?.usesCta && (
        <div className="space-y-2">
          <Label htmlFor="cta">קריאה לפעולה (CTA)</Label>
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
              className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
            />
          )}
        </div>
      )}

      {/* Custom Message Input */}
      {selectedTemplateId === "custom" && (
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
      )}

      {/* Non-Default Template Warning */}
      {!isSelectedTemplateDefault() && (
        <NonDefaultTemplateWarning 
          phoneNumber={customer.phone || ""} 
          message={generateCustomerMessage()} 
        />
      )}

      {/* Preview */}
      <div className="space-y-2">
        <Label>תצוגה מקדימה</Label>
        <WhatsappTemplatePreview template={generateCustomerMessage()} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          ביטול
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={isSending || !customer.phone}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? "שולח..." : "שלח הודעה"}
        </Button>
      </div>
    </div>
  );
}
