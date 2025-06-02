
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
      {/* Single Fixed Floating Action Button - Positioned higher to avoid bottom nav */}
      <button
        type="button"
        onClick={handleAddTask}
        className="fixed bottom-28 right-4 z-50 w-16 h-16 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 hover:shadow-2xl hover:from-carslead-purple/90 hover:to-carslead-blue/90"
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none'
        }}
        aria-label="הוסף משימה חדשה"
      >
        <Plus className="h-7 w-7" />
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
