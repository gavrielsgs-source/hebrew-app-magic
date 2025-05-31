
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import type { Document } from "@/hooks/use-documents";
import { Send } from "lucide-react";

interface DocumentWhatsAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentWhatsAppDialog({ isOpen, onClose, document }: DocumentWhatsAppDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [message, setMessage] = useState("");
  const { leads } = useLeads();

  useEffect(() => {
    if (document) {
      setMessage(`שלום,

אני שולח לך את המסמך: ${document.name}

ניתן לצפות במסמך בקישור הבא:
${document.url}

בברכה`);
    }
  }, [document]);

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => (lead.id as string) === leadId);
    if (selectedLead) {
      setSelectedLeadId(leadId);
      setPhoneNumber((selectedLead.phone as string) || "");
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // If already starts with 972, return as is
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // If starts with 0, replace with 972
    if (cleanPhone.startsWith('0')) {
      return '972' + cleanPhone.substring(1);
    }
    
    // If doesn't start with 972 or 0, add 972 prefix
    return '972' + cleanPhone;
  };

  const handleSend = () => {
    if (!phoneNumber) {
      toast.error("יש להזין מספר טלפון או לבחור לקוח");
      return;
    }

    const formattedNumber = formatPhoneForWhatsApp(phoneNumber);
    
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success("ההודעה נשלחה בוואטסאפ");
    handleClose();
  };

  const handleClose = () => {
    setPhoneNumber("");
    setSelectedLeadId("");
    setMessage("");
    onClose();
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>שליחת מסמך בוואטסאפ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-right mb-1 text-sm">{document.name}</h4>
            <p className="text-xs text-muted-foreground text-right">
              {document.type === 'contract' ? 'חוזה' : 
               document.type === 'quote' ? 'הצעת מחיר' :
               document.type === 'invoice' ? 'חשבונית' :
               document.type === 'receipt' ? 'קבלה' :
               document.type === 'other' ? 'אחר' : document.type}
            </p>
          </div>

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

          <div>
            <Label className="text-right text-sm">הודעה</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="text-right resize-none"
              dir="rtl"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            ביטול
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!phoneNumber || !message}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 ml-2" />
            שלח בוואטסאפ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
