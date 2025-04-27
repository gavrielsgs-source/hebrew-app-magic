
import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappTemplateForm } from "./WhatsappTemplateForm";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { Separator } from "@/components/ui/separator";
import { templates } from "./whatsapp-templates";
import { toast } from "sonner";
import { getCarImages } from "@/lib/image-utils";
import { ArrowLeft } from "lucide-react";
import { WhatsappPhoneInput } from "./components/WhatsappPhoneInput";
import { SelectedCarDetails } from "./components/SelectedCarDetails";
import { ImageWarning } from "./components/ImageWarning";

interface WhatsappTemplateSelectorProps {
  car: Car;
  onClose: () => void;
  initialPhoneNumber?: string;
}

export function WhatsappTemplateSelector({ car, onClose, initialPhoneNumber = "" }: WhatsappTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [customizedTemplate, setCustomizedTemplate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [carImages, setCarImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  
  useEffect(() => {
    const fetchCarImages = async () => {
      if (!car.id) return;
      
      setLoadingImages(true);
      try {
        const imageUrls = await getCarImages(car.id);
        setCarImages(imageUrls);
      } catch (error) {
        console.error('Error processing car images:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    
    fetchCarImages();
  }, [car.id]);
  
  useEffect(() => {
    const initialTemplate = selectedTemplate.template
      .replace(/\{\{make\}\}/g, car.make)
      .replace(/\{\{model\}\}/g, car.model)
      .replace(/\{\{year\}\}/g, car.year.toString())
      .replace(/\{\{price\}\}/g, formatPrice(car.price))
      .replace(/\{\{kilometers\}\}/g, car.kilometers?.toString() || "לא צוין")
      .replace(/\{\{color\}\}/g, car.exterior_color || "לא צוין")
      .replace(/\{\{engine\}\}/g, car.engine_size || "לא צוין")
      .replace(/\{\{transmission\}\}/g, car.transmission ? 
        (car.transmission === 'manual' ? 'ידני' : 
         car.transmission === 'automatic' ? 'אוטומט' : 
         car.transmission === 'robotics' ? 'רובוטי' : car.transmission) : "לא צוין")
      .replace(/\{\{fuel\}\}/g, car.fuel_type ? 
        (car.fuel_type === 'gasoline' ? 'בנזין' : 
         car.fuel_type === 'diesel' ? 'דיזל' : 
         car.fuel_type === 'hybrid' ? 'היברידי' : 
         car.fuel_type === 'electric' ? 'חשמלי' : car.fuel_type) : "לא צוין");
      
    setCustomizedTemplate(initialTemplate);
  }, [car, selectedTemplate]);

  const handleSendWhatsApp = () => {
    if (!phoneNumber) {
      toast.error("יש להזין מספר טלפון");
      return;
    }
    
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    const formattedNumber = cleanPhoneNumber.startsWith("972") 
      ? cleanPhoneNumber 
      : cleanPhoneNumber.startsWith("0") 
        ? "972" + cleanPhoneNumber.substring(1) 
        : "972" + cleanPhoneNumber;
    
    const encodedText = encodeURIComponent(customizedTemplate);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    
    if (carImages.length > 0) {
      const maxImages = Math.min(carImages.length, 3);
      const selectedImages = carImages.slice(0, maxImages);
      
      const imageUrls = selectedImages.join('\n');
      const imageMessage = `תמונות ${car.make} ${car.model}:\n${imageUrls}`;
      const encodedImageMessage = encodeURIComponent(imageMessage);
      const imageWhatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedImageMessage}`;
      
      setTimeout(() => {
        window.open(imageWhatsappUrl, '_blank');
      }, 1000);
    }
    
    toast.success("הודעת וואטסאפ נשלחה");
    onClose();
  };
  
  return (
    <div className="space-y-4 max-w-md mx-auto md:max-w-full">
      {/* כפתור חזרה במובייל */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="flex items-center justify-center text-xs gap-2 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          חזרה
        </Button>
      </div>

      <SelectedCarDetails car={car} />
      
      <Separator />
      
      <WhatsappPhoneInput phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} />
      
      <Tabs defaultValue="template" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template">בחר תבנית</TabsTrigger>
          <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template">
          <WhatsappTemplateForm 
            templates={templates}
            selectedTemplateId={selectedTemplate.id}
            customizedTemplate={customizedTemplate}
            onTemplateChange={handleTemplateChange}
            onCustomizedTemplateChange={setCustomizedTemplate}
          />
        </TabsContent>
        
        <TabsContent value="preview">
          <WhatsappTemplatePreview 
            template={customizedTemplate}
            images={carImages}
            loadingImages={loadingImages}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 rtl:space-x-reverse">
        <Button variant="outline" onClick={onClose} className="hidden md:inline-flex">
          ביטול
        </Button>
        <Button 
          onClick={handleSendWhatsApp}
          disabled={!phoneNumber || !customizedTemplate}
          className="bg-green-600 hover:bg-green-700"
        >
          שלח בוואטסאפ
        </Button>
      </div>
      
      <ImageWarning hasImages={carImages.length > 0} />
    </div>
  );
}
