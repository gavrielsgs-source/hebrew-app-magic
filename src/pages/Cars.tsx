
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { CarsTable } from "@/components/CarsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Grid, List, Send } from "lucide-react";
import { useCars } from "@/hooks/use-cars";
import { CarGrid } from "@/components/cars/CarGrid";

export default function Cars() {
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const { cars, isLoading } = useCars();

  return (
    <div className="p-4 md:p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול רכבים</h1>
        
        <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
          <DialogTrigger asChild>
            <Button>הוסף רכב חדש</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>הוסף רכב חדש</DialogTitle>
            </DialogHeader>
            <AddCarForm onSuccess={() => setIsAddCarOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <Send className="h-5 w-5" />
          <h2 className="font-medium">שליחת פרטי רכב בוואטסאפ</h2>
        </div>
        <p className="text-sm text-green-600">
          ניתן לשלוח פרטי רכב ללקוחות באמצעות וואטסאפ. לחץ על כפתור "שלח בוואטסאפ" בכרטיס הרכב ובחר את התבנית המתאימה.
        </p>
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            גריד
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            טבלה
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <CarGrid cars={cars} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="table">
          <CarsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
