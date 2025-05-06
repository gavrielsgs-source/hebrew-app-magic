
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CarGridEmpty() {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-muted mb-4">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">אין רכבים במלאי</h3>
      <p className="text-muted-foreground mb-4">
        התחל להוסיף רכבים למלאי שלך כדי לראות אותם כאן
      </p>
      <Button>הוסף רכב חדש</Button>
    </div>
  );
}
