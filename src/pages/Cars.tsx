import { useState } from "react";
import { useCars } from "@/hooks/use-cars";
import { CarsTable } from "@/components/CarsTable";
import { CarGrid } from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, LayoutGrid as LayoutGridIcon, Car } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddCarForm } from "@/components/cars/AddCarForm";

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
          carsCount={cars.length}
        />
        
        <div className="mt-6">
          <div className="px-4">
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
          </div>

          {viewMode === "grid" ? (
            <CarGrid cars={cars} isLoading={isLoading} />
          ) : (
            <div className="px-4">
              <CarsTable />
            </div>
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
              <AddCarForm onSuccess={onCarAdded} />
            )}
          </DialogContent>
        </Dialog>
      </MobileContainer>
    );
  }

  // Desktop view - simple clean header
  return (
    <>
      <SubscriptionLimitAlert 
        resourceType="car" 
        currentCount={cars.length} 
      />
      
      {/* Header inside container */}
      <div className="container mx-auto p-6" dir="rtl">
        <div className="bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-2xl p-6 border border-primary/10 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl shadow-md border border-primary/20">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-primary">
                  מלאי רכבים מתקדם
                </h1>
                <p className="text-muted-foreground text-lg font-medium">
                  מערכת ניהול מקצועית לכל הרכבים שלך • בקרה מלאה ונתונים בזמן אמת
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>מערכת פעילה</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>נתונים מסונכרנים</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
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
              <Button 
                onClick={handleAddCar}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl px-8 h-12 font-bold text-base transition-all duration-300 hover:shadow-xl hover:scale-105 border-0"
                disabled={!canAddCar}
              >
                <Plus className="h-5 w-5 ml-2" />
                הוסף רכב חדש
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content: full-width grid or contained table */}
      {viewMode === "grid" ? (
        <div className="w-full">
          <CarGrid cars={cars} isLoading={isLoading} />
        </div>
      ) : (
        <div className="container mx-auto p-6" dir="rtl">
          <CarsTable />
        </div>
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
    </>
  );
}
