
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { AddLeadForm } from "../AddLeadForm";

export function LeadsEmptyState() {
  return (
    <div className="text-center p-8 border rounded-lg bg-muted/30">
      <h3 className="text-lg font-medium mb-2">אין לקוחות להצגה</h3>
      <p className="text-muted-foreground mb-4">
        הוסף לקוחות חדשים כדי לראות אותם כאן
      </p>
      <Sheet>
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> הוסף לקוח
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>הוסף לקוח חדש</SheetTitle>
          </SheetHeader>
          <AddLeadForm />
        </SheetContent>
      </Sheet>
    </div>
  );
}
