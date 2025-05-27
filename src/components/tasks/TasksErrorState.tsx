
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface TasksErrorStateProps {
  onRetry: () => void;
}

export function TasksErrorState({ onRetry }: TasksErrorStateProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2F3C7E]">ניהול משימות</h2>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="flex items-center gap-2 hover:bg-blue-50"
        >
          <RefreshCcw className="h-4 w-4" />
          נסה שנית
        </Button>
      </div>
      <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <RefreshCcw className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-red-800 mb-2">לא ניתן לטעון את המשימות</p>
            <p className="text-sm text-red-600">אנא ודא שהנך מחובר ונסה שנית</p>
          </div>
        </div>
      </div>
    </div>
  );
}
