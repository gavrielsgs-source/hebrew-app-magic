
import { AlertTriangle } from "lucide-react";

interface CarTestDateProps {
  lastTestDate: string | null;
}

export function CarTestDate({ lastTestDate }: CarTestDateProps) {
  if (!lastTestDate) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
      <div>
        <h3 className="font-medium text-amber-800">מועד טסט אחרון</h3>
        <p className="text-amber-700 text-sm">
          {new Date(lastTestDate).toLocaleDateString('he-IL')}
        </p>
      </div>
    </div>
  );
}
