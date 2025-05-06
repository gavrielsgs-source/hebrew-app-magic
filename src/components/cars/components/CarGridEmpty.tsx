
import { Button } from "@/components/ui/button";
import { FilePlus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button asChild>
          <Link to="/cars/add">הוסף רכב חדש</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/documents">
            <FilePlus className="h-4 w-4 ml-2" />
            ניהול מסמכים
          </Link>
        </Button>
      </div>
    </div>
  );
}
