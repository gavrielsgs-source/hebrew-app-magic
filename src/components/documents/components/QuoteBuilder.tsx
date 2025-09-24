import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { FileText, Car, User, DollarSign } from "lucide-react";

interface QuoteBuilderProps {
  onClose: () => void;
}

interface QuoteData {
  leadId: string;
  carId: string;
  price: string;
  downPayment: string;
  monthlyPayment: string;
  terms: string;
  additionalDetails: string;
}

export function QuoteBuilder({ onClose }: QuoteBuilderProps) {
  const { leads } = useLeads();
  const { cars } = useCars();
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    leadId: "",
    carId: "",
    price: "",
    downPayment: "",
    monthlyPayment: "",
    terms: "12",
    additionalDetails: ""
  });

  const selectedLead = leads?.find(lead => lead.id === quoteData.leadId);
  const selectedCar = cars?.find(car => car.id === quoteData.carId);

  const handleInputChange = (field: keyof QuoteData, value: string) => {
    setQuoteData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuote = () => {
    if (!selectedLead || !selectedCar) return;

    const quoteContent = `
הצעת מחיר

פרטי לקוח:
שם: ${selectedLead.name}
טלפון: ${selectedLead.phone}

פרטי רכב:
יצרן: ${selectedCar.make}
דגם: ${selectedCar.model}
שנה: ${selectedCar.year}
מחיר מבוקש: ₪${selectedCar.price?.toLocaleString()}

הצעת מחיר:
מחיר סופי: ₪${parseInt(quoteData.price).toLocaleString()}
מקדמה: ₪${parseInt(quoteData.downPayment).toLocaleString()}
תשלום חודשי: ₪${parseInt(quoteData.monthlyPayment).toLocaleString()}
מספר תשלומים: ${quoteData.terms}

פרטים נוספים:
${quoteData.additionalDetails}

תוקף ההצעה: 30 ימים
תאריך: ${new Date().toLocaleDateString('he-IL')}
    `.trim();

    // יצירת קובץ PDF או הורדה
    const blob = new Blob([quoteContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `הצעת-מחיר-${selectedLead.name}-${selectedCar.make}-${selectedCar.model}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isValid = quoteData.leadId && quoteData.carId && quoteData.price;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-right">
        <CardTitle className="flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          בונה הצעות מחיר
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* בחירת לקוח */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-right">
            <User className="w-4 h-4" />
            בחר לקוח
          </Label>
          <Select value={quoteData.leadId} onValueChange={(value) => handleInputChange('leadId', value)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="בחר לקוח" />
            </SelectTrigger>
            <SelectContent align="end">
              {leads?.map(lead => (
                <SelectItem key={lead.id as string} value={lead.id as string}>
                  {lead.name as string} {lead.phone ? `(${lead.phone})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* בחירת רכב */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-right">
            <Car className="w-4 h-4" />
            בחר רכב
          </Label>
          <Select value={quoteData.carId} onValueChange={(value) => handleInputChange('carId', value)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="בחר רכב" />
            </SelectTrigger>
            <SelectContent align="end">
              {cars?.map(car => (
                <SelectItem key={car.id as string} value={car.id as string}>
                  {car.make as string} {car.model as string} {car.year as number} - ₪{(car.price as number)?.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* פרטי מחיר */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-right">
              <DollarSign className="w-4 h-4" />
              מחיר סופי
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={quoteData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-right">מקדמה</Label>
            <Input
              type="number"
              placeholder="0"
              value={quoteData.downPayment}
              onChange={(e) => handleInputChange('downPayment', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-right">תשלום חודשי</Label>
            <Input
              type="number"
              placeholder="0"
              value={quoteData.monthlyPayment}
              onChange={(e) => handleInputChange('monthlyPayment', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-right">מספר תשלומים</Label>
            <Select value={quoteData.terms} onValueChange={(value) => handleInputChange('terms', value)}>
              <SelectTrigger className="text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="12">12 חודשים</SelectItem>
                <SelectItem value="24">24 חודשים</SelectItem>
                <SelectItem value="36">36 חודשים</SelectItem>
                <SelectItem value="48">48 חודשים</SelectItem>
                <SelectItem value="60">60 חודשים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* פרטים נוספים */}
        <div className="space-y-2">
          <Label className="text-right">פרטים נוספים</Label>
          <Textarea
            placeholder="הוסף פרטים נוספים על ההצעה..."
            value={quoteData.additionalDetails}
            onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
            className="text-right min-h-[100px]"
          />
        </div>

        {/* כפתורי פעולה */}
        <div className="flex gap-4 justify-between">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button 
            onClick={generateQuote} 
            disabled={!isValid}
            className="bg-primary hover:bg-primary/90"
          >
            צור הצעת מחיר
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}