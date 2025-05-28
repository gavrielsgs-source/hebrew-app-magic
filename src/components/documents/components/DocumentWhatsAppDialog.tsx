
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import type { Document } from "@/hooks/use-documents";
import { X, Send, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    onClose();
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
      <DialogContent 
        className={`${
          isMobile 
            ? "w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] m-2 p-4 overflow-y-auto" 
            : "max-w-lg"
        }`} 
        dir="rtl"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-right text-lg">שליחת מסמך בוואטסאפ</DialogTitle>
            {isMobile ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className={`space-y-4 ${isMobile ? 'pt-2' : 'pt-4'}`}>
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

          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
              rows={isMobile ? 6 : 8}
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className={`flex gap-2 ${isMobile ? 'flex-col-reverse' : 'justify-end'}`}>
            <Button variant="outline" onClick={handleClose} className={isMobile ? 'w-full' : ''}>
              ביטול
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!phoneNumber || !message}
              className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'w-full' : ''}`}
            >
              <Send className="w-4 h-4 ml-2" />
              שלח בוואטסאפ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
