
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CarSearchSelect } from "@/components/cars/CarSearchSelect";
import { useAuth } from "@/hooks/use-auth";
import { useCreateLead } from "@/hooks/leads/use-create-lead";
import { useCars } from "@/hooks/use-cars";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, FileText, Car, Building, Search, ChevronDown, ChevronUp } from "lucide-react";

interface MobileAddLeadFormProps {
  carId?: string;
  onSuccess?: () => void;
}

export function MobileAddLeadForm({ carId, onSuccess }: MobileAddLeadFormProps) {
  const { user } = useAuth();
  const { cars } = useCars();
  const addLead = useCreateLead();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    car_id: carId || "",
    source: "ידני",
    interested_make: "",
    interested_model: "",
    interested_year_from: "",
    interested_year_to: "",
    interested_max_price: "",
    interested_max_km: "",
  });
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [interestedOpen, setInterestedOpen] = useState(false);

  // Enhanced mobile-first submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('MobileAddLeadForm - Submit handler called');
    
    if (!user?.id) {
      toast({
        title: "שגיאה",
        description: "אנא התחבר מחדש למערכת",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "שגיאה",
        description: "יש למלא שם ומספר טלפון",
        variant: "destructive",
      });
      return;
    }

    try {
      const leadData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        notes: formData.notes || null,
        car_id: formData.car_id || null,
        source: formData.source,
        status: "new",
        assigned_to: null,
        user_id: user.id,
        interested_make: formData.interested_make || null,
        interested_model: formData.interested_model || null,
        interested_year_from: formData.interested_year_from ? Number(formData.interested_year_from) : null,
        interested_year_to: formData.interested_year_to ? Number(formData.interested_year_to) : null,
        interested_max_price: formData.interested_max_price ? Number(formData.interested_max_price) : null,
        interested_max_km: formData.interested_max_km ? Number(formData.interested_max_km) : null,
      };

      console.log('MobileAddLeadForm - Creating lead with data:', leadData);

      await addLead.mutateAsync({ leadData, sendWhatsApp });
      
      toast({
        title: "ליד נוסף",
        description: sendWhatsApp ? "הליד נוסף והודעת ברוכים הבאים נשלחה" : "הליד נוסף בהצלחה",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("שגיאה בהוספת ליד:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הליד: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Enhanced mobile button handler
  const handleSubmitClick = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('MobileAddLeadForm - Submit button clicked/touched');
    
    // Trigger form submission programmatically
    const form = (e.currentTarget as HTMLElement).closest('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          שם מלא *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="הכנס שם מלא"
          className="h-12 text-right"
          dir="rtl"
          required
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
          <Phone className="h-4 w-4" />
          מספר טלפון *
        </Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="050-1234567"
          className="h-12 text-right"
          dir="rtl"
          required
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          אימייל
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="example@email.com"
          className="h-12 text-right"
          dir="rtl"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        />
      </div>

      {/* Car Selection */}
      {!carId && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Car className="h-4 w-4" />
            רכב מעוניין
          </Label>
          <CarSearchSelect
            value={formData.car_id}
            onValueChange={(value) => setFormData({ ...formData, car_id: value })}
            placeholder="בחר רכב (אופציונלי)"
          />
        </div>
      )}

      {/* Source */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Building className="h-4 w-4" />
          מקור הליד
        </Label>
        <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
          <SelectTrigger className="h-12" dir="rtl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="ידני">ידני</SelectItem>
            <SelectItem value="אתר">אתר</SelectItem>
            <SelectItem value="פייסבוק">פייסבוק</SelectItem>
            <SelectItem value="גוגל">גוגל</SelectItem>
            <SelectItem value="המלצה">המלצה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          הערות
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="הערות נוספות..."
          className="min-h-[80px] text-right"
          dir="rtl"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        />
      </div>

      {/* Interested Car Section */}
      <Collapsible open={interestedOpen} onOpenChange={setInterestedOpen} className="border rounded-lg p-3">
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
          <span className="flex items-center gap-2">
            📋 התראה על רכב עתידי
          </span>
          {interestedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <p className="text-xs text-muted-foreground">
            אם הלקוח מחפש רכב שעדיין לא במלאי, מלא כאן ונעדכן אותך כשיגיע רכב מתאים.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">יצרן</Label>
              <Input placeholder="למשל: טויוטה" value={formData.interested_make} onChange={(e) => setFormData({ ...formData, interested_make: e.target.value })} className="h-10" dir="rtl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">דגם</Label>
              <Input placeholder="למשל: קורולה" value={formData.interested_model} onChange={(e) => setFormData({ ...formData, interested_model: e.target.value })} className="h-10" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">משנה</Label>
              <Input type="number" placeholder="2020" value={formData.interested_year_from} onChange={(e) => setFormData({ ...formData, interested_year_from: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">עד שנה</Label>
              <Input type="number" placeholder="2025" value={formData.interested_year_to} onChange={(e) => setFormData({ ...formData, interested_year_to: e.target.value })} className="h-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">תקציב מקסימלי (₪)</Label>
              <Input type="number" placeholder="150000" value={formData.interested_max_price} onChange={(e) => setFormData({ ...formData, interested_max_price: e.target.value })} className="h-10" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">ק"מ מקסימלי</Label>
              <Input type="number" placeholder="100000" value={formData.interested_max_km} onChange={(e) => setFormData({ ...formData, interested_max_km: e.target.value })} className="h-10" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Send WhatsApp Welcome */}
      <div className="flex items-center space-x-2 space-x-reverse py-2">
        <Checkbox 
          id="send-whatsapp" 
          checked={sendWhatsApp}
          onCheckedChange={(checked) => setSendWhatsApp(checked === true)}
        />
        <Label htmlFor="send-whatsapp" className="text-sm">
          שלח הודעת ברוכים הבאים בוואטסאפ
        </Label>
      </div>

      {/* Enhanced Submit Button with full mobile support */}
      <Button 
        type="submit" 
        onClick={handleSubmitClick}
        onTouchStart={handleSubmitClick}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-lg font-semibold min-h-[56px] transition-colors" 
        disabled={addLead.isPending}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none'
        }}
      >
        {addLead.isPending ? "מוסיף..." : "הוסף ליד"}
      </Button>
    </form>
  );
}
