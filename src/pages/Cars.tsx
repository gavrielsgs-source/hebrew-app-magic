
import { useState } from "react";
import { useCars } from "@/hooks/use-cars";
import { CarsTable } from "@/components/CarsTable";
import { CarGrid } from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, LayoutGrid as LayoutGridIcon } from "lucide-react";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';
import { LimitAwareButton } from '@/components/subscription/LimitAwareButton';
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { CarsMobileHeader } from "@/components/cars/page/CarsMobileHeader";
import { MobileButton } from "@/components/mobile/MobileButton";

export default function Cars() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const { cars = [], isLoading, addCar } = useCars();
  const { checkEntitlement } = useSubscription();
  const canAddCar = checkEntitlement('carLimit', cars.length + 1);
  const isMobile = useIsMobile();

  const onCarAdded = () => {
    // Handled by the hook's internal logic
  };

  const handleAddCar = () => {
    console.log("Add car clicked");
  };

  const handleWhatsApp = () => {
    console.log("WhatsApp clicked");
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  if (isMobile) {
    return (
      <MobileContainer withPadding={false}>
        <SubscriptionLimitAlert 
          featureKey="carLimit" 
          currentCount={cars.length} 
          entityName="רכבים" 
        />

        <CarsMobileHeader
          onAddCar={handleAddCar}
          onWhatsApp={handleWhatsApp}
          onFilter={handleFilter}
          carsCount={cars.length}
        />
        
        <div className="px-4 mt-6">
          <div className="flex gap-3 mb-6">
            <MobileButton 
              variant="outline" 
              size="md"
              fullWidth={false}
              className="flex-1"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              icon={viewMode === 'grid' ? <TableIcon className="h-5 w-5" /> : <LayoutGridIcon className="h-5 w-5" />}
            >
              {viewMode === 'grid' ? 'טבלה' : 'גריד'}
            </MobileButton>
            
            <SwipeDialog>
              <DialogTrigger asChild>
                <LimitAwareButton
                  resourceType="car"
                  currentCount={cars.length}
                  size="sm"
                  className="flex-2"
                  onAction={() => {}}
                >
                  <Plus className="h-5 w-5 ml-2" />
                  הוסף רכב
                </LimitAwareButton>
              </DialogTrigger>
              <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>הוסף רכב חדש</DialogTitle>
                </DialogHeader>
                <AddCarForm onSuccess={onCarAdded} />
              </DialogContent>
            </SwipeDialog>
          </div>

          {viewMode === "grid" ? (
            <CarGrid cars={cars} isLoading={isLoading} />
          ) : (
            <CarsTable />
          )}
        </div>
      </MobileContainer>
    );
  }

  // Desktop view - keep existing code
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
          <SwipeDialog>
            <DialogTrigger asChild>
              <LimitAwareButton
                resourceType="car"
                currentCount={cars.length}
                size="sm"
                className="flex items-center gap-2"
                onAction={() => {}}
              >
                <Plus className="h-4 w-4 ml-1" />
                הוסף רכב
              </LimitAwareButton>
            </DialogTrigger>
            <DialogContent className="w-[90%] sm:w-[600px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>הוסף רכב חדש</DialogTitle>
              </DialogHeader>
              <AddCarForm onSuccess={onCarAdded} />
            </DialogContent>
          </SwipeDialog>
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
