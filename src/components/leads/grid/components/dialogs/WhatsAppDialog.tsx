
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    <SwipeDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[600px]">
        <DialogHeader>
          <DialogTitle>שליחת הודעה בוואטסאפ</DialogTitle>
        </DialogHeader>
        <WhatsappLeadTemplateSelector
          leadName={leadName}
          leadPhone={leadPhone}
          leadSource={leadSource}
          leadId={leadId}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </SwipeDialog>
  );
}
