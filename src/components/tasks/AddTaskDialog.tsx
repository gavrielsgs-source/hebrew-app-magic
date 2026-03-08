
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Default trigger button
  const trigger = children || (
    <button
      type="button"
      className={`
        ${isMobile ? 
          'w-full h-14 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98]' : 
          'bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white rounded-xl px-4 py-2 flex items-center gap-2'
        }
      `}
    >
      <Plus className="h-5 w-5" />
      {isMobile ? 'הוסף משימה חדשה' : 'משימה חדשה'}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!initialDate && controlledOpen === undefined && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialDate 
              ? `משימה חדשה ל-${initialDate.toLocaleDateString('he-IL')}`
              : 'משימה חדשה'
            }
          </DialogTitle>
          <DialogDescription>
            צור משימה חדשה ונהל את הזמן שלך
          </DialogDescription>
        </DialogHeader>
        
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
