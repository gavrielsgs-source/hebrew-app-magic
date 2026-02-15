
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
import { supabase } from "@/integrations/supabase/client";

interface DocumentWhatsAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export function DocumentWhatsAppDialog({ isOpen, onClose, document: doc }: DocumentWhatsAppDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { leads } = useLeads();

  useEffect(() => {
    if (doc) {
      setMessage(`שלום,

אני שולח לך את המסמך: ${doc.name}

ניתן לצפות במסמך ולהוריד אותו בקישור הבא:
[הקישור ייווצר אוטומטית]

בברכה`);
    }
  }, [doc]);

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => (lead.id as string) === leadId);
    if (selectedLead) {
      setSelectedLeadId(leadId);
      setPhoneNumber((selectedLead.phone as string) || "");
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('972')) return cleanPhone;
    if (cleanPhone.startsWith('0')) return '972' + cleanPhone.substring(1);
    return '972' + cleanPhone;
  };

  const handleSend = async () => {
    if (!phoneNumber || !doc) {
      toast.error("יש להזין מספר טלפון או לבחור לקוח");
      return;
    }

    setIsSending(true);

    try {
      const filePath = doc.file_path;
      if (!filePath) {
        toast.error("אין קובץ למסמך זה");
        setIsSending(false);
        return;
      }

      // Check for existing active share
      const { data: existingShare } = await supabase
        .from('document_shares' as any)
        .select('share_id')
        .eq('document_id', doc.id)
        .is('revoked_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      let shareId: string;

      if (existingShare) {
        shareId = (existingShare as any).share_id;
      } else {
        const { data: user } = await supabase.auth.getUser();
        const newShareId = crypto.randomUUID();

        const { error: insertError } = await supabase
          .from('document_shares' as any)
          .insert({
            document_id: doc.id,
            share_id: newShareId,
            user_id: user.user?.id,
            file_path: filePath,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (insertError) {
          console.error('Share insert error:', insertError);
          toast.error('שגיאה ביצירת קישור שיתוף');
          setIsSending(false);
          return;
        }

        shareId = newShareId;
      }

      const shareUrl = `https://hebrew-app-magic.lovable.app/share/document/${shareId}`;

      // Replace placeholder in message with actual URL
      const finalMessage = message.replace(
        /\[הקישור ייווצר אוטומטית\]/g,
        shareUrl
      ).replace(
        doc.url || '___NO_MATCH___',
        shareUrl
      );

      const formattedNumber = formatPhoneForWhatsApp(phoneNumber);
      const encodedText = encodeURIComponent(finalMessage);
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');

      toast.success("ההודעה נשלחה בוואטסאפ");
      handleClose();
    } catch (error) {
      console.error('Error creating share:', error);
      toast.error('שגיאה בשליחת המסמך');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setSelectedLeadId("");
    setMessage("");
    onClose();
  };

  if (!doc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>שליחת מסמך בוואטסאפ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-right mb-1 text-sm">{doc.name}</h4>
            <p className="text-xs text-muted-foreground text-right">
              {doc.type === 'contract' ? 'חוזה' : 
               doc.type === 'quote' ? 'הצעת מחיר' :
               doc.type === 'invoice' ? 'חשבונית' :
               doc.type === 'receipt' ? 'קבלה' :
               doc.type === 'other' ? 'אחר' : doc.type}
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
            disabled={!phoneNumber || !message || isSending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 ml-2" />
            {isSending ? 'מכין קישור...' : 'שלח בוואטסאפ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
