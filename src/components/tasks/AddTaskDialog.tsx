
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
}

export function AddTaskDialog({ 
  children, 
  initialLeadId, 
  initialCarId, 
  initialDate,
  onSuccess 
}: AddTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Auto-open dialog when initialDate is provided
  useEffect(() => {
    if (initialDate) {
      setIsOpen(true);
    }
  }, [initialDate]);

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
        {!initialDate && (
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
        )}
        <DialogContent className="h-[90vh] overflow-auto">
          <TaskForm 
            onSuccess={handleSuccess}
            initialLeadId={initialLeadId}
            initialCarId={initialCarId}
            initialDate={initialDate}
          />
        </DialogContent>
      </SwipeDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!initialDate && (
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
