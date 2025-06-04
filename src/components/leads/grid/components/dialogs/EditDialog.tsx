
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditLeadForm } from "@/components/leads/EditLeadForm";

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  leadPhone?: string;
}

export function EditDialog({
  isOpen,
  onOpenChange,
  leadId,
  leadName,
  leadPhone
}: EditDialogProps) {
  return (
    <SwipeDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>עריכת ליד - {leadName}</DialogTitle>
        </DialogHeader>
        <EditLeadForm 
          lead={{ id: leadId, name: leadName, phone: leadPhone }}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </SwipeDialog>
  );
}
