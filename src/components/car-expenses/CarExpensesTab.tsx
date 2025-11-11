import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCarExpenseDialog } from "./AddCarExpenseDialog";
import { CarExpensesList } from "./CarExpensesList";

interface CarExpensesTabProps {
  carId: string;
}

export const CarExpensesTab = ({ carId }: CarExpensesTabProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">הוצאות הרכב</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="ml-2 h-4 w-4" />
          הוסף הוצאה
        </Button>
      </div>

      <CarExpensesList carId={carId} />

      <AddCarExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        carId={carId}
      />
    </div>
  );
};
