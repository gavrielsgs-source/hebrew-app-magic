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
import jsPDF from "jspdf";

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

    const doc = new jsPDF();
    
    // הגדרת גופן עברי (משתמש בגופן ברירת מחדל שתומך בעברית)
    doc.setFont("helvetica");
    
    // כותרת
    doc.setFontSize(22);
    doc.text("הצעת מחיר", 105, 30, { align: "center" });
    
    // קו מפריד
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    let yPosition = 60;
    
    // פרטי לקוח
    doc.setFontSize(16);
    doc.text("פרטי לקוח:", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`שם: ${selectedLead.name}`, 30, yPosition);
    yPosition += 8;
    doc.text(`טלפון: ${selectedLead.phone || "לא צוין"}`, 30, yPosition);
    yPosition += 15;
    
    // פרטי רכב
    doc.setFontSize(16);
    doc.text("פרטי רכב:", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`יצרן: ${selectedCar.make}`, 30, yPosition);
    yPosition += 8;
    doc.text(`דגם: ${selectedCar.model}`, 30, yPosition);
    yPosition += 8;
    doc.text(`שנה: ${selectedCar.year}`, 30, yPosition);
    yPosition += 8;
    doc.text(`מחיר מבוקש: ${selectedCar.price?.toLocaleString()} ש"ח`, 30, yPosition);
    yPosition += 15;
    
    // הצעת מחיר
    doc.setFontSize(16);
    doc.text("הצעת מחיר:", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`מחיר סופי: ${parseInt(quoteData.price).toLocaleString()} ש"ח`, 30, yPosition);
    yPosition += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    if (quoteData.downPayment) {
      doc.text(`מקדמה: ${parseInt(quoteData.downPayment).toLocaleString()} ש"ח`, 30, yPosition);
      yPosition += 8;
    }
    if (quoteData.monthlyPayment) {
      doc.text(`תשלום חודשי: ${parseInt(quoteData.monthlyPayment).toLocaleString()} ש"ח`, 30, yPosition);
      yPosition += 8;
      doc.text(`מספר תשלומים: ${quoteData.terms}`, 30, yPosition);
      yPosition += 8;
    }
    yPosition += 10;
    
    // פרטים נוספים
    if (quoteData.additionalDetails) {
      doc.setFontSize(16);
      doc.text("פרטים נוספים:", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(quoteData.additionalDetails, 160);
      doc.text(splitText, 30, yPosition);
      yPosition += splitText.length * 6 + 10;
    }
    
    // תוקף ההצעה ותאריך
    yPosition += 10;
    doc.setFontSize(12);
    doc.text("תוקף ההצעה: 30 ימים", 20, yPosition);
    yPosition += 8;
    doc.text(`תאריך: ${new Date().toLocaleDateString("he-IL")}`, 20, yPosition);
    
    // שמירת הקובץ
    const fileName = `הצעת-מחיר-${selectedLead.name}-${selectedCar.make}-${selectedCar.model}.pdf`;
    doc.save(fileName);
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
            הורד הצעת מחיר כ-PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}