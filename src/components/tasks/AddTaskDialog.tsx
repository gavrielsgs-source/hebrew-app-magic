
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

  console.log('AddTaskDialog render:', { 
    controlledOpen, 
    internalOpen, 
    isMobile,
    initialDate 
  });

  // Use controlled props if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  // Auto-open dialog when initialDate is provided (only for uncontrolled mode)
  useEffect(() => {
    if (initialDate && controlledOpen === undefined) {
      console.log('Auto-opening dialog for initialDate');
      setInternalOpen(true);
    }
  }, [initialDate, controlledOpen]);

  const handleSuccess = () => {
    console.log('AddTaskDialog - Task created successfully');
    setIsOpen(false);
    onSuccess?.();
  };

  const handleOpenChange = (open: boolean) => {
    console.log('AddTaskDialog - Open state change:', open);
    setIsOpen(open);
  };

  // Simple mobile-friendly trigger button
  const trigger = children || (
    <button
      type="button"
      className={`
        ${isMobile ? 
          'w-full h-14 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3' : 
          'bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white rounded-xl px-4 py-2 flex items-center gap-2'
        }
      `}
      onClick={() => {
        console.log('AddTaskDialog - Trigger button clicked');
        setIsOpen(true);
      }}
    >
      <Plus className="h-5 w-5" />
      {isMobile ? 'הוסף משימה חדשה' : 'משימה חדשה'}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!initialDate && !controlledOpen && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className={isMobile ? "p-4" : "max-w-2xl"}>
        <div className="space-y-4" dir="rtl">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#2F3C7E] mb-2">
              {initialDate 
                ? `משימה חדשה ל-${initialDate.toLocaleDateString('he-IL')}`
                : 'משימה חדשה'
              }
            </h2>
            <p className="text-gray-600">צור משימה חדשה ונהל את הזמן שלך</p>
          </div>
          
          <TaskForm 
            onSuccess={handleSuccess}
            initialLeadId={initialLeadId}
            initialCarId={initialCarId}
            initialDate={initialDate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
