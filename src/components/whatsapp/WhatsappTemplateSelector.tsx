
import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappTemplateForm } from "./WhatsappTemplateForm";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { Separator } from "@/components/ui/separator";
import { templates } from "./whatsapp-templates";
import { toast } from "sonner";
import { getCarImages } from "@/lib/image-utils";

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
  
  const handleTemplateChange = (templateId: string) => {
    const newTemplate = templates.find(t => t.id === templateId) || templates[0];
    setSelectedTemplate(newTemplate);
  };
  
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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">רכב נבחר:</h3>
        <p className="text-muted-foreground">
          {car.make} {car.model} {car.year} • {formatPrice(car.price)}
        </p>
      </div>
      
      <Separator />
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          מספר טלפון של הלקוח
        </label>
        <div className="flex gap-2">
          <input
            id="phone"
            type="tel"
            placeholder="דוגמה: 0541234567"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            dir="rtl"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ניתן להזין עם או בלי קידומת (972)
        </p>
      </div>
      
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
        <Button variant="outline" onClick={onClose}>
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
      
      {carImages.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
          <p className="font-medium">שים לב:</p>
          <p>
            בגלל מגבלות של וואטסאפ, יש להוסיף את התמונות באופן ידני בכל חלונית שתיפתח
          </p>
        </div>
      )}
    </div>
  );
}
