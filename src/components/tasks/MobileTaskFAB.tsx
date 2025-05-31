
import { useState } from "react";
import { Plus } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileTaskFAB() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const isMobile = useIsMobile();

  // Only show on mobile
  if (!isMobile) return null;

  const handleAddTask = () => {
    console.log('MobileTaskFAB - Opening add task dialog');
    setIsAddTaskOpen(true);
  };

  const handleSuccess = () => {
    console.log('MobileTaskFAB - Task added successfully');
    setIsAddTaskOpen(false);
  };

  return (
    <>
      {/* Fixed Floating Action Button */}
      <button
        type="button"
        onClick={handleAddTask}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 hover:shadow-xl"
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none'
        }}
        aria-label="הוסף משימה חדשה"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
