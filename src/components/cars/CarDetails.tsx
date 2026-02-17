import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { getCarImages } from "@/lib/image-utils";
import { Edit } from "lucide-react";
import { EditCarForm } from "./forms/EditCarForm";
import { CarImagesCarousel } from "./details/CarImagesCarousel";
import { CarHeader } from "./details/CarHeader";
import { CarGeneralTab } from "./details/CarGeneralTab";
import { CarOwnerTab } from "./details/CarOwnerTab";
import { CarDocumentsTab } from "./details/CarDocumentsTab";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface CarDetailsProps {
  car: Car;
}

export function CarDetails({ car }: CarDetailsProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        const imageUrls = await getCarImages(car.id);
        setImages(imageUrls);
      } catch (error) {
        console.error("Error fetching car images:", error);
      } finally {
        setLoadingImages(false);
      }
    };
    fetchImages();
  }, [car.id]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header row: title + edit button */}
      <div className="flex justify-between items-center">
        <CarHeader
          make={car.make}
          model={car.model}
          year={car.year}
          price={car.price}
          status={car.status}
        />
        <SwipeDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              ערוך רכב
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] sm:w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>עריכת רכב</DialogTitle>
            </DialogHeader>
            <EditCarForm car={car} onCancel={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </SwipeDialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 rounded-lg">
          <TabsTrigger value="general" className="flex-1 sm:flex-none">כללי</TabsTrigger>
          <TabsTrigger value="owner" className="flex-1 sm:flex-none">מוכר וקונה</TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 sm:flex-none">מסמכים</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: details grid */}
            <CarGeneralTab car={car} />

            {/* Right side: images + notes */}
            <div className="space-y-4">
              <CarImagesCarousel
                images={images}
                loadingImages={loadingImages}
                carMake={car.make}
                carModel={car.model}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="owner" className="mt-4">
          <CarOwnerTab ownerCustomerId={car.owner_customer_id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <CarDocumentsTab carId={car.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
