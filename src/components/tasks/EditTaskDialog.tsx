
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MobileButton } from "@/components/mobile/MobileButton";
import { MobileCard } from "@/components/mobile/MobileCard";
import { Edit } from "lucide-react";
import { EditTaskForm } from "./form/EditTaskForm";
import type { Task } from "@/types/task";

interface EditTaskDialogProps {
  task: Task;
  children?: React.ReactNode;
}

export function EditTaskDialog({ task, children }: EditTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const trigger = children || (
    isMobile ? (
      <MobileButton
        variant="outline"
        size="sm"
        icon={<Edit className="h-4 w-4" />}
        className="rounded-xl"
      >
        עריכה
      </MobileButton>
    ) : (
      <Button variant="outline" size="sm" className="rounded-xl">
        <Edit className="h-4 w-4 ml-2" />
        עריכה
      </Button>
    )
  );

  const formContent = (
    <EditTaskForm 
      task={task}
      onSuccess={handleSuccess}
    />
  );

  if (isMobile) {
    return (
      <SwipeDialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="h-[90vh] overflow-auto">
          <MobileCard 
            className="mx-0 my-0" 
            contentClassName="p-6"
            dir="rtl"
            header={
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#2F3C7E] mb-2">עריכת משימה</h2>
                <p className="text-gray-600">ערוך את פרטי המשימה</p>
              </div>
            }
          >
            {formContent}
          </MobileCard>
        </DialogContent>
      </SwipeDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <div className="space-y-6 p-6 bg-white rounded-xl" dir="rtl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">עריכת משימה</h2>
            <p className="text-gray-600">ערוך את פרטי המשימה</p>
          </div>
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
