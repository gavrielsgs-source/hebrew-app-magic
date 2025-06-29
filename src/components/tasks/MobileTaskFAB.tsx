
import { useState } from "react";
import { Plus } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export function MobileTaskFAB() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Only show on mobile and only on the Tasks page
  if (!isMobile || location.pathname !== '/tasks') return null;

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
      {/* Clean Floating Action Button */}
      <button
        type="button"
        onClick={handleAddTask}
        className="fixed bottom-36 right-4 z-50 w-16 h-16 bg-[#2F3C7E] hover:bg-[#1A2347] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:shadow-xl border border-gray-200"
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
