import { useState } from "react";
import { useCars } from "@/hooks/use-cars";
import { CarsTable } from "@/components/CarsTable";
import { CarGrid } from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, LayoutGrid as LayoutGridIcon, Car } from "lucide-react";
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
import { StandardPageHeader } from "@/components/common/StandardPageHeader";

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
          resourceType="car" 
          currentCount={cars.length} 
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

  // Desktop view - with StandardPageHeader
  return (
    <>
      <SubscriptionLimitAlert 
        resourceType="car" 
        currentCount={cars.length} 
      />
      
      <StandardPageHeader
        title="מלאי רכבים"
        subtitle="ניהול רכבים זמינים למכירה"
        icon={Car}
        actionButton={{
          label: "הוסף רכב חדש",
          onClick: handleAddCar,
          icon: Plus
        }}
      >
        <div className="flex gap-2">
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
        </div>
      </StandardPageHeader>

      <div className="p-6">

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
    </>
  );
}
