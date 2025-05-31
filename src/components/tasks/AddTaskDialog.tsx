
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Plus } from "lucide-react";
import { TaskForm } from "./TaskForm";

interface AddTaskDialogProps {
  children?: React.ReactNode;
  initialLeadId?: string;
  initialCarId?: string;
  initialDate?: Date | null;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTaskDialog({ 
  children, 
  initialLeadId, 
  initialCarId, 
  initialDate,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: AddTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use controlled props if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  // Auto-open dialog when initialDate is provided (only for uncontrolled mode)
  useEffect(() => {
    if (initialDate && controlledOpen === undefined) {
      setInternalOpen(true);
    }
  }, [initialDate, controlledOpen]);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  const trigger = children || (
    isMobile ? (
      <MobileButton
        variant="primary"
        size="lg"
        icon={<Plus className="h-5 w-5" />}
        className="w-full rounded-full shadow-lg"
      >
        משימה חדשה
      </MobileButton>
    ) : (
      <Button className="bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white rounded-xl">
        <Plus className="h-4 w-4 ml-2" />
        משימה חדשה
      </Button>
    )
  );

  if (isMobile) {
    return (
      <SwipeDialog open={isOpen} onOpenChange={setIsOpen}>
        {!initialDate && !controlledOpen && (
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
        )}
        <DialogContent className="h-[90vh] overflow-auto p-2">
          <div className="p-4">
            <TaskForm 
              onSuccess={handleSuccess}
              initialLeadId={initialLeadId}
              initialCarId={initialCarId}
              initialDate={initialDate}
            />
          </div>
        </DialogContent>
      </SwipeDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!initialDate && !controlledOpen && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <TaskForm 
          onSuccess={handleSuccess}
          initialLeadId={initialLeadId}
          initialCarId={initialCarId}
          initialDate={initialDate}
        />
      </DialogContent>
    </Dialog>
  );
}
