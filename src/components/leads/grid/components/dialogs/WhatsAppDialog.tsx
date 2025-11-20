
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WhatsappLeadTemplateSelector } from "@/components/whatsapp/WhatsappLeadTemplateSelector";

interface WhatsAppDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadSource?: string;
}

export function WhatsAppDialog({
  isOpen,
  onOpenChange,
  leadId,
  leadName,
  leadPhone,
  leadSource
}: WhatsAppDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[600px]">
        <DialogHeader>
          <DialogTitle>שליחת הודעה בוואטסאפ</DialogTitle>
          <DialogDescription className="sr-only">בחר תבנית ושלח הודעת וואטסאפ ללקוח</DialogDescription>
        </DialogHeader>
        <WhatsappLeadTemplateSelector
          leadName={leadName}
          leadPhone={leadPhone}
          leadSource={leadSource}
          leadId={leadId}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
