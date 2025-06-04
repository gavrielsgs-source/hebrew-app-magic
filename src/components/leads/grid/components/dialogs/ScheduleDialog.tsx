
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScheduleMeetingForm } from "@/components/leads/ScheduleMeetingForm";

interface ScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  leadPhone?: string;
}

export function ScheduleDialog({
  isOpen,
  onOpenChange,
  leadId,
  leadName,
  leadPhone
}: ScheduleDialogProps) {
  return (
    <SwipeDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>קבע פגישה/תזכורת - {leadName}</DialogTitle>
        </DialogHeader>
        <ScheduleMeetingForm 
          lead={{ id: leadId, name: leadName, phone: leadPhone }}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </SwipeDialog>
  );
}
