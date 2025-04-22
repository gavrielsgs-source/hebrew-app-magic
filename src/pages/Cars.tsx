
import { useState } from "react";
import { useCars } from "@/hooks/use-cars";
import { CarsTable } from "@/components/CarsTable";
import { CarGrid } from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, LayoutGrid as LayoutGridIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';

export default function Cars() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const { cars = [], isLoading, addCar } = useCars();
  const { checkEntitlement } = useSubscription();
  const canAddCar = checkEntitlement('carLimit', cars.length + 1);

  const onCarAdded = () => {
    // Handled by the hook's internal logic
  };

  return (
    <div className="p-6">
      <SubscriptionLimitAlert 
        featureKey="carLimit" 
        currentCount={cars.length} 
        entityName="רכבים" 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="text-right">
          <h1 className="text-2xl font-bold tracking-tight">מלאי רכבים</h1>
          <p className="text-muted-foreground mt-1">
            ניהול רכבים זמינים למכירה
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <>
                <TableIcon className="h-4 w-4 ml-1" />
                תצוגת טבלה
              </>
            ) : (
              <>
                <LayoutGridIcon className="h-4 w-4 ml-1" />
                תצוגת גריד
              </>
            )}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                size="sm" 
                className="flex items-center gap-2"
                disabled={!canAddCar}
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף רכב
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[90%] sm:w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>הוסף רכב חדש</SheetTitle>
              </SheetHeader>
              <AddCarForm onSuccess={onCarAdded} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {viewMode === "grid" ? (
        <CarGrid cars={cars} isLoading={isLoading} />
      ) : (
        <CarsTable />
      )}
    </div>
  );
}
