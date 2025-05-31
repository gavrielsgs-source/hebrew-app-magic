
import { TasksPage } from "@/components/tasks/TasksPage";
import { Suspense } from "react";

export default function Tasks() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-600">טוען משימות...</div>
        </div>
      </div>
    }>
      <div className="rtl-fix min-h-screen">
        <TasksPage />
      </div>
    </Suspense>
  );
}
