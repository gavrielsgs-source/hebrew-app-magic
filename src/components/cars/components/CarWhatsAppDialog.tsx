import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import { Car } from "@/types/car";
import { Send, Car as CarIcon } from "lucide-react";

interface CarWhatsAppDialogProps {
  car: Car;
  onClose: () => void;
}

export function CarWhatsAppDialog({ car, onClose }: CarWhatsAppDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [message, setMessage] = useState("");
  const { leads } = useLeads();

  useEffect(() => {
    if (car) {
      const carMessage = `שלום,

אני רוצה להציג לך רכב מעולה:

🚗 ${car.make} ${car.model} (${car.year})
💰 מחיר: ${car.price.toLocaleString()} ₪
📏 קילומטרים: ${car.kilometers.toLocaleString()}
${car.fuel_type ? `⛽ סוג דלק: ${car.fuel_type}` : ''}
${car.transmission ? `⚙️ תיבת הילוכים: ${car.transmission}` : ''}
${car.exterior_color ? `🎨 צבע: ${car.exterior_color}` : ''}

${car.description ? `📝 תיאור: ${car.description}` : ''}

מעוניין/ת בפרטים נוספים או בתיאום צפייה?

בברכה,
צוות המכירות`;

      setMessage(carMessage);
    }
  }, [car]);

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => (lead.id as string) === leadId);
    if (selectedLead) {
      setSelectedLeadId(leadId);
      setPhoneNumber((selectedLead.phone as string) || "");
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // If already starts with 972, return as is
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // If starts with 0, replace with 972
    if (cleanPhone.startsWith('0')) {
      return '972' + cleanPhone.substring(1);
    }
    
    // If doesn't start with 972 or 0, add 972 prefix
    return '972' + cleanPhone;
  };

  const handleSend = () => {
    if (!phoneNumber) {
      toast.error("יש להזין מספר טלפון או לבחור לקוח");
      return;
    }

    const formattedNumber = formatPhoneForWhatsApp(phoneNumber);
    
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success("ההודעה נשלחה בוואטסאפ");
    onClose();
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Car Details Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <CarIcon className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-right">
              {car.make} {car.model} ({car.year})
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="text-right">מחיר: {car.price.toLocaleString()} ₪</div>
            <div className="text-right">ק"מ: {car.kilometers.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <Label className="text-right text-sm">בחר לקוח</Label>
          <Select value={selectedLeadId} onValueChange={handleLeadSelect}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="בחר לקוח" />
            </SelectTrigger>
            <SelectContent align="end">
              {leads?.map(lead => (
                <SelectItem key={lead.id as string} value={lead.id as string}>
                  {lead.name as string} {lead.phone ? `(${lead.phone as string})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-right text-sm">מספר טלפון</Label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="05X-XXXXXXX"
            className="text-right"
            dir="ltr"
          />
        </div>
      </div>

      <div>
        <Label className="text-right text-sm">הודעה</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={12}
          className="text-right resize-none"
          dir="rtl"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          ביטול
        </Button>
        <Button 
          onClick={handleSend}
          disabled={!phoneNumber || !message}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Send className="w-4 h-4 ml-2" />
          שלח בוואטסאפ
        </Button>
      </div>
    </div>
  );
}