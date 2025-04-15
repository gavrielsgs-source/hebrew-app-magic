
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { CarsTable } from "@/components/CarsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Grid, List } from "lucide-react";
import { useCars } from "@/hooks/use-cars";
import { CarGrid } from "@/components/cars/CarGrid";

export default function Cars() {
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const { cars, isLoading } = useCars();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול רכבים</h1>
        
        <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
          <DialogTrigger asChild>
            <Button>הוסף רכב חדש</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>הוסף רכב חדש</DialogTitle>
            </DialogHeader>
            <AddCarForm onSuccess={() => setIsAddCarOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="table">
        <TabsList className="mb-4">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            טבלה
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            גריד
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <CarsTable />
        </TabsContent>
        
        <TabsContent value="grid">
          <CarGrid cars={cars} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
