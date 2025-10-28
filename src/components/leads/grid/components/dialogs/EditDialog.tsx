
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditLeadForm } from "@/components/leads/EditLeadForm";

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
}

export function EditDialog({
  isOpen,
  onOpenChange,
  lead
}: EditDialogProps) {
  return (
    <SwipeDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>עריכת ליד - {lead.name}</DialogTitle>
        </DialogHeader>
        <EditLeadForm 
          lead={lead}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </SwipeDialog>
  );
}
