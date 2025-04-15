
import { useState } from "react";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsappTemplateForm } from "./WhatsappTemplateForm";
import { WhatsappTemplatePreview } from "./WhatsappTemplatePreview";
import { Separator } from "@/components/ui/separator";
import { templates } from "./whatsapp-templates";

interface WhatsappTemplateSelectorProps {
  car: Car;
  onClose: () => void;
}

export function WhatsappTemplateSelector({ car, onClose }: WhatsappTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [customizedTemplate, setCustomizedTemplate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Initialize the template when selectedTemplate changes
  useState(() => {
    const initialTemplate = selectedTemplate.template
      .replace("{{make}}", car.make)
      .replace("{{model}}", car.model)
      .replace("{{year}}", car.year.toString())
      .replace("{{price}}", formatPrice(car.price))
      .replace("{{kilometers}}", car.kilometers?.toString() || "")
      .replace("{{color}}", car.exterior_color || "")
      .replace("{{engine}}", car.engine_size || "")
      .replace("{{transmission}}", car.transmission || "")
      .replace("{{fuel}}", car.fuel_type || "");
      
    setCustomizedTemplate(initialTemplate);
  });
  
  const handleTemplateChange = (templateId: string) => {
    const newTemplate = templates.find(t => t.id === templateId) || templates[0];
    setSelectedTemplate(newTemplate);
    
    // Update customized template with the new template
    const updatedTemplate = newTemplate.template
      .replace("{{make}}", car.make)
      .replace("{{model}}", car.model)
      .replace("{{year}}", car.year.toString())
      .replace("{{price}}", formatPrice(car.price))
      .replace("{{kilometers}}", car.kilometers?.toString() || "")
      .replace("{{color}}", car.exterior_color || "")
      .replace("{{engine}}", car.engine_size || "")
      .replace("{{transmission}}", car.transmission || "")
      .replace("{{fuel}}", car.fuel_type || "");
      
    setCustomizedTemplate(updatedTemplate);
  };
  
  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(customizedTemplate);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
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
            placeholder="972541234567"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
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
            onEdit={() => {}}
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
        >
          שלח בוואטסאפ
        </Button>
      </div>
    </div>
  );
}
