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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// התקנת גופנים
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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

    const docDefinition = {
      content: [
        // כותרת
        {
          text: 'הצעת מחיר',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        
        // קו מפריד
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
          margin: [0, 0, 0, 20]
        },
        
        // פרטי לקוח
        {
          text: 'פרטי לקוח:',
          style: 'subheader',
          margin: [0, 0, 0, 10]
        },
        {
          ul: [
            `שם: ${selectedLead.name}`,
            `טלפון: ${selectedLead.phone || 'לא צוין'}`
          ],
          margin: [20, 0, 0, 15]
        },
        
        // פרטי רכב
        {
          text: 'פרטי רכב:',
          style: 'subheader',
          margin: [0, 0, 0, 10]
        },
        {
          ul: [
            `יצרן: ${selectedCar.make}`,
            `דגם: ${selectedCar.model}`,
            `שנה: ${selectedCar.year}`,
            `מחיר מבוקש: ${selectedCar.price?.toLocaleString()} ש"ח`
          ],
          margin: [20, 0, 0, 15]
        },
        
        // הצעת מחיר
        {
          text: 'הצעת מחיר:',
          style: 'subheader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'מחיר סופי:', bold: true },
                { text: `${parseInt(quoteData.price).toLocaleString()} ש"ח`, bold: true, color: '#22c55e' }
              ],
              ...(quoteData.downPayment ? [[
                'מקדמה:',
                `${parseInt(quoteData.downPayment).toLocaleString()} ש"ח`
              ]] : []),
              ...(quoteData.monthlyPayment ? [[
                'תשלום חודשי:',
                `${parseInt(quoteData.monthlyPayment).toLocaleString()} ש"ח`
              ]] : []),
              ...(quoteData.monthlyPayment ? [[
                'מספר תשלומים:',
                `${quoteData.terms} חודשים`
              ]] : [])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        
        // פרטים נוספים
        ...(quoteData.additionalDetails ? [
          {
            text: 'פרטים נוספים:',
            style: 'subheader',
            margin: [0, 0, 0, 10]
          },
          {
            text: quoteData.additionalDetails,
            margin: [20, 0, 0, 20]
          }
        ] : []),
        
        // תוקף ותאריך
        {
          text: [
            { text: 'תוקף ההצעה: ', bold: true },
            '30 ימים\n',
            { text: 'תאריך: ', bold: true },
            new Date().toLocaleDateString('he-IL')
          ],
          margin: [0, 20, 0, 0]
        }
      ],
      
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#1f2937'
        },
        subheader: {
          fontSize: 16,
          bold: true,
          color: '#374151'
        }
      },
      
      defaultStyle: {
        fontSize: 12,
        font: 'Roboto'
      }
    };

    const fileName = `הצעת-מחיר-${selectedLead.name}-${selectedCar.make}-${selectedCar.model}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
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