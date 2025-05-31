
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditTaskForm } from "./form/EditTaskForm";
import type { Task } from "@/types/task";

interface EditTaskDialogProps {
  task: Task;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditTaskDialog({ task, children, open: controlledOpen, onOpenChange: controlledOnOpenChange }: EditTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use controlled props if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const trigger = children || (
    <Button variant="outline" size="sm" className="rounded-xl">
      <Edit className="h-4 w-4 ml-2" />
      עריכה
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className={isMobile ? "p-4" : "max-w-2xl"}>
        <div className="space-y-6" dir="rtl">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#2F3C7E] mb-2">עריכת משימה</h2>
            <p className="text-gray-600">ערוך את פרטי המשימה</p>
          </div>
          <EditTaskForm 
            task={task}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
