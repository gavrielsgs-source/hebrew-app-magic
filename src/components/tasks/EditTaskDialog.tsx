
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditTaskForm } from "./form/EditTaskForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const trigger = children || (
    <Button variant="outline" size="sm" className="rounded-xl border-2 font-semibold hover:bg-primary/10 transition-all duration-200">
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
      <DialogContent className={cn(
        "rounded-2xl border-2 shadow-xl",
        isMobile ? "max-w-[95vw] max-h-[85vh] overflow-y-auto" : "sm:max-w-[480px]"
      )}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">עריכת משימה</DialogTitle>
          <DialogDescription className="text-right text-muted-foreground">
            ערוך את פרטי המשימה
          </DialogDescription>
        </DialogHeader>
        
        <EditTaskForm 
          task={task}
          onSuccess={handleSuccess}
          isMobile={isMobile}
        />
      </DialogContent>
    </Dialog>
  );
}
