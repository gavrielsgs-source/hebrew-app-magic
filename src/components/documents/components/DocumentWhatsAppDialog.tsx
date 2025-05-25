
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import type { Document } from "@/hooks/use-documents";
import { X, Send } from "lucide-react";

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

  useState(() => {
    if (document) {
      setMessage(`שלום,

אני שולח לך את המסמך: ${document.name}

ניתן לצפות במסמך בקישור הבא:
${document.url}

בברכה`);
    }
  }, [document]);

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => lead.id === leadId);
    if (selectedLead) {
      setSelectedLeadId(leadId);
      setPhoneNumber(selectedLead.phone || "");
    }
  };

  const handleSend = () => {
    if (!phoneNumber) {
      toast.error("יש להזין מספר טלפון או לבחור לקוח");
      return;
    }

    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    const formattedNumber = cleanPhoneNumber.startsWith("972") 
      ? cleanPhoneNumber 
      : cleanPhoneNumber.startsWith("0") 
        ? "972" + cleanPhoneNumber.substring(1) 
        : "972" + cleanPhoneNumber;
    
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
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-right">שליחת מסמך בוואטסאפ</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-right mb-1">{document.name}</h4>
            <p className="text-sm text-muted-foreground text-right">
              {document.type === 'contract' ? 'חוזה' : 
               document.type === 'quote' ? 'הצעת מחיר' :
               document.type === 'invoice' ? 'חשבונית' :
               document.type === 'receipt' ? 'קבלה' :
               document.type === 'other' ? 'אחר' : document.type}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-right">בחר לקוח</Label>
              <Select value={selectedLeadId} onValueChange={handleLeadSelect}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent align="end">
                  {leads?.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} {lead.phone ? `(${lead.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-right">מספר טלפון</Label>
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
            <Label className="text-right">הודעה</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className="flex justify-end gap-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
