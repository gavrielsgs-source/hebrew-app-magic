
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עריכת משימה</DialogTitle>
          <DialogDescription>
            ערוך את פרטי המשימה
          </DialogDescription>
        </DialogHeader>
        
        <EditTaskForm 
          task={task}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
