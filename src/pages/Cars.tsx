
import { useState } from "react";
import { useCars } from "@/hooks/use-cars";
import { CarsTable } from "@/components/CarsTable";
import { CarGrid } from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, LayoutGrid as LayoutGridIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { MobileAddCarForm } from "@/components/cars/MobileAddCarForm";
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';
import { LimitAwareButton } from "@/components/subscription/LimitAwareButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { CarsMobileHeader } from "@/components/cars/page/CarsMobileHeader";
import { MobileButton } from "@/components/mobile/MobileButton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Cars() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { cars = [], isLoading, addCar } = useCars();
  const { checkEntitlement } = useSubscription();
  const { toast } = useToast();
  const canAddCar = checkEntitlement('carLimit', cars.length + 1);
  const isMobile = useIsMobile();

  const onCarAdded = () => {
    setShowAddDialog(false);
    toast({
      title: "רכב נוסף",
      description: "הרכב נוסף בהצלחה למלאי!",
    });
  };

  const handleAddCar = () => {
    console.log("Add car clicked, can add car:", canAddCar);
    setShowAddDialog(true);
  };

  const handleWhatsApp = () => {
    console.log("WhatsApp clicked");
    window.open('https://web.whatsapp.com', '_blank');
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
            
            <MobileButton
              variant="outline"
              size="md"
              onClick={handleAddCar}
              icon={<Plus className="h-5 w-5" />}
              className="flex-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              הוסף רכב
            </MobileButton>
          </div>

          {viewMode === "grid" ? (
            <CarGrid cars={cars} isLoading={isLoading} />
          ) : (
            <CarsTable />
          )}
        </div>

        {/* Add Car Dialog for Mobile */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">הוסף רכב חדש</DialogTitle>
            </DialogHeader>
            
            {!canAddCar ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 text-right">
                  הגעת למגבלת המנוי. לא ניתן להוסיף עוד רכבים. אנא שדרג את המנוי שלך.
                </AlertDescription>
              </Alert>
            ) : (
              <MobileAddCarForm onSuccess={onCarAdded} />
            )}
          </DialogContent>
        </Dialog>
      </MobileContainer>
    );
  }

  // Desktop view - fixed both buttons
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
                <TableIcon className="h-4 w-4 mr-1" />
                תצוגת טבלה
              </>
            ) : (
              <>
                <LayoutGridIcon className="h-4 w-4 mr-1" />
                תצוגת גריד
              </>
            )}
          </Button>
          <LimitAwareButton
            resourceType="car"
            currentCount={cars.length}
            onAction={handleAddCar}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            הוסף רכב
          </LimitAwareButton>
        </div>
      </div>

      {viewMode === "grid" ? (
        <CarGrid cars={cars} isLoading={isLoading} />
      ) : (
        <CarsTable />
      )}

      {/* Add Car Dialog for Desktop */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[90%] sm:w-[600px] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">הוסף רכב חדש</DialogTitle>
          </DialogHeader>
          
          {!canAddCar ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600 text-right">
                הגעת למגבלת המנוי. לא ניתן להוסיף עוד רכבים. אנא שדרג את המנוי שלך.
              </AlertDescription>
            </Alert>
          ) : (
            <AddCarForm onSuccess={onCarAdded} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
