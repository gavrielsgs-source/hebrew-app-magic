import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileDocumentHeader } from "@/components/mobile/MobileDocumentHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calculator, Download, UserPlus, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn, formatPrice } from "@/lib/utils";
import { PriceQuoteData } from "@/types/document-production";
import { useToast } from "@/hooks/use-toast";
import { CustomerAndLeadSearchSelect } from "@/components/customers/CustomerAndLeadSearchSelect";
import { usePriceQuote } from "@/hooks/price-quote/use-price-quote";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { generatePriceQuotePDF } from "@/utils/price-quote-pdf-generator";
import { useUploadProductionDocument } from "@/hooks/use-upload-production-document";

const priceQuoteSchema = z.object({
  date: z.string().min(1, "תאריך נדרש"),
  leadId: z.string().optional(),
  customerId: z.string().optional(),
  includeVAT: z.boolean().default(true),
  customer: z.object({
    fullName: z.string().min(2, "שם מלא נדרש"),
    firstName: z.string().min(2, "שם פרטי נדרש"),
    phone: z.string().optional(),
    email: z.string().optional(),
    city: z.string().min(2, "עיר נדרשת"),
    address: z.string().min(5, "כתובת מלאה נדרשת"),
  }),
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, "תיאור נדרש"),
    unitPrice: z.number().min(0, "מחיר יחידה חייב להיות חיובי"),
    quantity: z.number().min(1, "כמות חייבת להיות לפחות 1"),
    discount: z.number().min(0, "הנחה חייבת להיות חיובית"),
    totalPrice: z.number().min(0, "מחיר כולל חייב להיות חיובי"),
    notes: z.string().optional(),
  })).min(1, "חובה להוסיף לפחות פריט אחד"),
  validUntil: z.string().min(1, "תוקף ההצעה נדרש"),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

type PriceQuoteFormValues = z.infer<typeof priceQuoteSchema>;

export default function PriceQuote() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { createPriceQuote, isCreating } = usePriceQuote();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();
  const [showPreview, setShowPreview] = useState(false);
  const [savedQuoteData, setSavedQuoteData] = useState<PriceQuoteData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [useExisting, setUseExisting] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<PriceQuoteFormValues>({
    resolver: zodResolver(priceQuoteSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      includeVAT: true,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      customer: {
        fullName: "שם הלקוח",
        firstName: "שם פרטי",
        phone: "",
        email: "",
        city: "תל אביב",
        address: "רחוב הרצל 1",
      },
      items: [{
        id: "1",
        description: "פריט ראשון",
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        totalPrice: 0,
        notes: "",
      }],
      terms: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const includeVAT = form.watch("includeVAT");
  const subtotal = watchedItems.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
  const totalDiscount = watchedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const subtotalAfterDiscount = subtotal - totalDiscount;
  const vat = includeVAT ? subtotalAfterDiscount * 0.18 : 0;
  const total = subtotalAfterDiscount + vat;

  const handleEntitySelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity({ type: value.type, id: value.id });
    
    if (value.type === 'lead') {
      // Set leadId in form
      form.setValue("leadId", value.id);
      form.setValue("customerId", undefined);
      
      // Sync customer data from lead
      form.setValue("customer.fullName", value.data.name || "");
      form.setValue("customer.firstName", value.data.name?.split(' ')[0] || "");
      form.setValue("customer.phone", value.data.phone || "");
      form.setValue("customer.email", value.data.email || "");
    } else {
      // Set customerId in form
      form.setValue("customerId", value.id);
      form.setValue("leadId", undefined);
      
      // Sync customer data
      form.setValue("customer.fullName", value.data.full_name || "");
      form.setValue("customer.firstName", value.data.full_name?.split(' ')[0] || "");
      form.setValue("customer.phone", value.data.phone || "");
      form.setValue("customer.email", value.data.email || "");
      form.setValue("customer.city", value.data.city || "תל אביב");
      form.setValue("customer.address", value.data.address || "");
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItem = { ...watchedItems[index] };
    (updatedItem as any)[field] = value;
    
    if (field === 'unitPrice' || field === 'quantity') {
      updatedItem.totalPrice = (updatedItem.unitPrice || 0) * (updatedItem.quantity || 1) - (updatedItem.discount || 0);
    } else if (field === 'discount') {
      updatedItem.totalPrice = (updatedItem.unitPrice || 0) * (updatedItem.quantity || 1) - (Number(value) || 0);
    }
    
    form.setValue(`items.${index}`, updatedItem);
  };

  const addItem = () => {
    append({
      id: (fields.length + 1).toString(),
      description: "",
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      totalPrice: 0,
      notes: "",
    });
  };

  const onSubmit = async (data: PriceQuoteFormValues) => {
    try {
      const quoteData: Omit<PriceQuoteData, 'quoteNumber'> = {
        date: data.date,
        validUntil: data.validUntil,
        includeVAT: data.includeVAT,
        customer: {
          fullName: data.customer.fullName,
          firstName: data.customer.firstName,
          phone: data.customer.phone,
          email: data.customer.email,
          city: data.customer.city,
          address: data.customer.address,
        },
        items: data.items.map(item => ({
          id: item.id,
          description: item.description,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: item.discount,
          totalPrice: item.totalPrice,
          notes: item.notes,
        })),
        financial: {
          subtotal,
          totalDiscount,
          vat: data.includeVAT ? vat : undefined,
          total,
        },
        terms: data.terms,
        notes: data.notes,
      };

      const result = await createPriceQuote(quoteData);
      setSavedQuoteData(result);
      setIsSaved(true);
      
      toast({
        title: "הצעת המחיר נשמרה בהצלחה",
        description: `מספר הצעה: ${result.quoteNumber}`,
      });
      
      // Generate PDF as Blob and upload to cloud
      try {
        const pdfBlob = await generatePriceQuotePDF(result, true) as Blob;
        
        // Determine entity type and ID
        let entityType: string | undefined;
        let entityId: string | undefined;
        
        if (data.customerId) {
          entityType = 'customer';
          entityId = data.customerId;
        } else if (data.leadId) {
          entityType = 'lead';
          entityId = data.leadId;
        }
        
        const url = await uploadDocument({
          pdfBlob,
          documentType: 'price_quote',
          documentNumber: result.quoteNumber,
          customerName: result.customer.fullName,
          entityType,
          entityId
        });
        
        setDocumentUrl(url);
        setShowPreview(true);
      } catch (uploadError) {
        console.error("Error uploading PDF:", uploadError);
        // PDF upload failed but the quote was saved
        toast({
          title: "הקובץ לא הועלה לענן",
          description: "ההצעה נשמרה אבל ההעלאה לענן נכשלה. תוכל להוריד PDF ידנית.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving price quote:", error);
      toast({
        title: "שגיאה בשמירת הצעת המחיר",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    const formData = form.getValues();
    
    // Build quote data from saved data or form data
    const quoteData: PriceQuoteData = savedQuoteData || {
      quoteNumber: "טיוטה",
      date: formData.date,
      validUntil: formData.validUntil,
      includeVAT: formData.includeVAT,
      customer: {
        fullName: formData.customer.fullName || "",
        firstName: formData.customer.firstName || "",
        phone: formData.customer.phone,
        email: formData.customer.email,
        city: formData.customer.city || "",
        address: formData.customer.address || "",
      },
      items: formData.items.map(item => ({
        id: item.id || "",
        description: item.description || "",
        unitPrice: item.unitPrice || 0,
        quantity: item.quantity || 1,
        discount: item.discount || 0,
        totalPrice: item.totalPrice || 0,
        notes: item.notes,
      })),
      financial: {
        subtotal,
        totalDiscount,
        vat: formData.includeVAT ? vat : undefined,
        total,
      },
      terms: formData.terms,
      notes: formData.notes,
    };
    
    try {
      await generatePriceQuotePDF(quoteData);
      toast({
        title: "הצעת המחיר הורדה בהצלחה",
        description: `קובץ PDF של הצעה ${quoteData.quoteNumber} נשמר למחשב`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה ביצירת PDF",
        description: "אירעה שגיאה ביצירת קובץ ה-PDF",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppSend = () => {
    const formData = form.getValues();
    const customerData = savedQuoteData?.customer || formData.customer;
    const quoteNumber = savedQuoteData?.quoteNumber || "טיוטה";
    const totalAmount = savedQuoteData?.financial.total || total;
    const validUntil = savedQuoteData?.validUntil || formData.validUntil;
    
    // Build message with document link if available
    let message = `שלום ${customerData.firstName || customerData.fullName},\n\nהצעת מחיר מספר: ${quoteNumber}\nסכום: ${totalAmount.toFixed(2)} ₪\nתוקף: ${new Date(validUntil).toLocaleDateString('he-IL')}`;
    
    if (documentUrl) {
      message += `\n\n📄 לצפייה והורדת הקובץ:\n${documentUrl}`;
    }
    
    message += '\n\nנשמח לעמוד לרשותך!';
    
    // Clean phone number - remove all non-digits
    let phone = customerData.phone?.replace(/[^\d]/g, '');
    
    if (phone) {
      // Handle different phone formats
      if (phone.startsWith('972')) {
        phone = phone;
      } else if (phone.startsWith('0')) {
        phone = '972' + phone.slice(1);
      } else {
        phone = '972' + phone;
      }
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast({
        title: "מספר טלפון חסר",
        description: "יש להזין מספר טלפון ללקוח כדי לשלוח וואטסאפ",
        variant: "destructive",
      });
    }
  };

  if (isMobile) {
    return (
      <MobileContainer withPadding={false} withBottomNav={true}>
        <MobileDocumentHeader 
          title="הצעת מחיר" 
          icon={<Calculator className="h-5 w-5" />}
        />
        
        {/* Save Status Indicator */}
        {isSaved && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">נשמר בענן</span>
          </div>
        )}
        
        <div className="p-4 space-y-4 pb-44">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Quote Details - Mobile */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b pb-3">
                <CardTitle className="text-right flex items-center gap-2 text-lg justify-end">
                  <span>פרטי הצעה</span>
                  <Calculator className="h-5 w-5 text-purple-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm">תאריך</Label>
                    <Input
                      id="date"
                      type="date"
                      {...form.register("date")}
                      className="text-right h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil" className="text-sm">תוקף עד</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      {...form.register("validUntil")}
                      className="text-right h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information - Mobile */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b pb-3">
                <CardTitle className="text-right text-lg">פרטי הלקוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={useExisting ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseExisting(true)}
                    className="flex-1 h-10 rounded-xl"
                  >
                    לקוח קיים
                  </Button>
                  <Button
                    type="button"
                    variant={!useExisting ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseExisting(false);
                      setSelectedEntity(null);
                      form.setValue("leadId", undefined);
                      form.setValue("customerId", undefined);
                    }}
                    className="flex-1 h-10 flex items-center gap-2 rounded-xl"
                  >
                    <UserPlus className="h-4 w-4" />
                    חדש
                  </Button>
                </div>

                {useExisting && (
                  <CustomerAndLeadSearchSelect
                    value={selectedEntity}
                    onValueChange={handleEntitySelect}
                    placeholder="חפש לקוח או ליד..."
                  />
                )}

                <div className="space-y-3">
                  <Input
                    {...form.register("customer.fullName")}
                    className="text-right h-11 rounded-xl"
                    placeholder="שם מלא"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      {...form.register("customer.phone")}
                      className="text-right h-11 rounded-xl"
                      placeholder="טלפון"
                    />
                    <Input
                      type="email"
                      {...form.register("customer.email")}
                      className="text-right h-11 rounded-xl"
                      placeholder="אימייל"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      {...form.register("customer.city")}
                      className="text-right h-11 rounded-xl"
                      placeholder="עיר"
                    />
                    <Input
                      {...form.register("customer.address")}
                      className="text-right h-11 rounded-xl"
                      placeholder="כתובת"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items - Mobile */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b pb-3">
                <div className="flex items-center justify-between">
                  <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-1 rounded-xl h-9">
                    <Plus className="h-4 w-4" />
                    הוסף
                  </Button>
                  <CardTitle className="text-lg">פריטים</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-3 bg-muted/30 rounded-xl border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="h-8 px-2 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="font-medium text-sm">פריט {index + 1}</span>
                      </div>

                      <Textarea
                        {...form.register(`items.${index}.description`)}
                        className="text-right min-h-[60px] rounded-xl"
                        placeholder="תיאור הפריט..."
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">מחיר</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.unitPrice`, { 
                              valueAsNumber: true,
                              onChange: (e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            })}
                            className="text-right h-10 rounded-xl text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">כמות</Label>
                          <Input
                            type="number"
                            min="1"
                            {...form.register(`items.${index}.quantity`, { 
                              valueAsNumber: true,
                              onChange: (e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            })}
                            className="text-right h-10 rounded-xl text-sm"
                            placeholder="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">הנחה</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.discount`, { 
                              valueAsNumber: true,
                              onChange: (e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)
                            })}
                            className="text-right h-10 rounded-xl text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="p-2 bg-purple-50 rounded-xl text-center">
                        <span className="font-bold text-purple-700">סה"כ: {formatPrice(watchedItems[index]?.totalPrice || 0)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Additional Details - Mobile */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b pb-3">
                <CardTitle className="text-right text-lg">פרטים נוספים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Textarea
                  {...form.register("terms")}
                  className="text-right min-h-[80px] rounded-xl"
                  placeholder="תנאים כלליים..."
                />
                <Textarea
                  {...form.register("notes")}
                  className="text-right min-h-[60px] rounded-xl"
                  placeholder="הערות נוספות..."
                />
              </CardContent>
            </Card>

            {/* Financial Summary - Mobile */}
            <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 p-5 text-white">
                <h3 className="text-lg font-bold text-center mb-4">סיכום כספי</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>סכום חלקי</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>הנחות</span>
                    <span className="font-semibold">-{formatPrice(totalDiscount)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-white/20 rounded-xl my-2">
                    <Label htmlFor="includeVAT-mobile" className="text-white cursor-pointer">
                      {includeVAT ? "כולל מע״מ" : "ללא מע״מ"}
                    </Label>
                    <Switch
                      id="includeVAT-mobile"
                      checked={form.watch("includeVAT")}
                      onCheckedChange={(checked) => form.setValue("includeVAT", checked)}
                    />
                  </div>

                  {includeVAT && (
                    <div className="flex justify-between">
                      <span>מע״מ (18%)</span>
                      <span className="font-semibold">{formatPrice(vat)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-white/30 pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>סה"כ לתשלום</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="fixed bottom-28 left-0 right-0 p-3 bg-background border-t shadow-lg z-50">
              <div className="space-y-1.5 max-w-md mx-auto">
                <Button type="submit" className="w-full h-11 rounded-xl text-base font-bold" disabled={isCreating}>
                  {isCreating ? "שומר..." : "שמור הצעת מחיר"}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="h-9 rounded-xl"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="h-9 bg-green-600 hover:bg-green-700 rounded-xl"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    וואטסאפ
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Preview */}
          {showPreview && savedQuoteData && (
            <Card className="rounded-2xl border-2 mt-4">
              <CardContent className="p-4 text-right text-sm space-y-2">
                <div className="font-bold text-lg mb-2">תצוגה מקדימה</div>
                <div><strong>מספר:</strong> {savedQuoteData.quoteNumber}</div>
                <div><strong>לקוח:</strong> {savedQuoteData.customer.fullName}</div>
                <div className="text-lg font-bold text-purple-600">{formatPrice(savedQuoteData.financial.total)}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileContainer>
    );
  }

  // Desktop Layout
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-8 text-right">
        <h1 className="text-4xl font-bold bg-gradient-to-l from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
          הצעת מחיר
        </h1>
        <p className="text-muted-foreground text-lg">
          צור הצעת מחיר מפורטת ללקוח
        </p>
      </div>
      
      {/* Save Status Indicator */}
      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">הצעת המחיר נשמרה בענן</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Details */}
            <Card className="border-2 shadow-lg rounded-2xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b">
                <CardTitle className="text-right text-xl flex items-center gap-2 justify-end">
                  <span>פרטי הצעה</span>
                  <Calculator className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">תאריך</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal rounded-xl",
                            !form.watch("date") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                          <span>{form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('he-IL') : "בחר תאריך"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={form.watch("date") ? new Date(form.watch("date")) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("date", date.toISOString().split('T')[0]);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">תוקף עד</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal rounded-xl",
                            !form.watch("validUntil") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                          <span>{form.watch("validUntil") ? new Date(form.watch("validUntil")).toLocaleDateString('he-IL') : "בחר תאריך"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={form.watch("validUntil") ? new Date(form.watch("validUntil")) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("validUntil", date.toISOString().split('T')[0]);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.validUntil && (
                      <p className="text-sm text-destructive">{form.formState.errors.validUntil.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-2 shadow-lg rounded-2xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b">
                <CardTitle className="text-right text-xl">פרטי הלקוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={useExisting ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseExisting(true)}
                    className="rounded-xl"
                  >
                    בחר לקוח קיים
                  </Button>
                  <Button
                    type="button"
                    variant={!useExisting ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseExisting(false);
                      setSelectedEntity(null);
                      form.setValue("leadId", undefined);
                      form.setValue("customerId", undefined);
                    }}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <UserPlus className="h-4 w-4" />
                    לקוח חדש
                  </Button>
                </div>

                {useExisting && (
                  <div className="space-y-2">
                    <Label htmlFor="entity">בחר לקוח או ליד</Label>
                    <CustomerAndLeadSearchSelect
                      value={selectedEntity}
                      onValueChange={handleEntitySelect}
                      placeholder="חפש לקוח או ליד..."
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <Input
                      id="fullName"
                      {...form.register("customer.fullName")}
                      className="text-right rounded-xl"
                      placeholder="שם מלא"
                    />
                    {form.formState.errors.customer?.fullName && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      {...form.register("customer.phone")}
                      className="text-right rounded-xl"
                      placeholder="050-1234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("customer.email")}
                      className="text-right rounded-xl"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">עיר</Label>
                    <Input
                      id="city"
                      {...form.register("customer.city")}
                      className="text-right rounded-xl"
                      placeholder="תל אביב"
                    />
                    {form.formState.errors.customer?.city && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">כתובת</Label>
                    <Input
                      id="address"
                      {...form.register("customer.address")}
                      className="text-right rounded-xl"
                      placeholder="רחוב הרצל 1"
                    />
                    {form.formState.errors.customer?.address && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.address.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="border-2 shadow-lg rounded-2xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b">
                <div className="flex items-center justify-between">
                  <Button type="button" onClick={addItem} className="flex items-center gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    הוסף פריט
                  </Button>
                  <CardTitle className="text-xl">פריטים</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 rounded-xl border-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                          מחק
                        </Button>
                        <h4 className="font-medium">פריט {index + 1}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label>תיאור הפריט</Label>
                          <Textarea
                            {...form.register(`items.${index}.description`)}
                            className="text-right rounded-xl"
                            placeholder="תיאור הפריט..."
                          />
                          {form.formState.errors.items?.[index]?.description && (
                            <p className="text-sm text-destructive">{form.formState.errors.items[index]?.description?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>מחיר יחידה</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.unitPrice`, { 
                              valueAsNumber: true,
                              onChange: (e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            })}
                            className="text-right rounded-xl"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>כמות</Label>
                          <Input
                            type="number"
                            min="1"
                            {...form.register(`items.${index}.quantity`, { 
                              valueAsNumber: true,
                              onChange: (e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            })}
                            className="text-right rounded-xl"
                            placeholder="1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>הנחה</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.discount`, { 
                              valueAsNumber: true,
                              onChange: (e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)
                            })}
                            className="text-right rounded-xl"
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>הערות</Label>
                          <Input
                            {...form.register(`items.${index}.notes`)}
                            className="text-right rounded-xl"
                            placeholder="הערות לפריט"
                          />
                        </div>
                      </div>

                      <div className="text-right p-3 bg-muted/50 rounded-xl">
                        <span className="font-bold">סה"כ פריט: {formatPrice(watchedItems[index]?.totalPrice || 0)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="border-2 shadow-lg rounded-2xl">
              <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b">
                <CardTitle className="text-right text-xl">פרטים נוספים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="terms">תנאים כלליים</Label>
                  <Textarea
                    id="terms"
                    {...form.register("terms")}
                    className="text-right min-h-[100px] rounded-xl"
                    placeholder="תנאי תשלום, תנאי אחריות וכו'..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    {...form.register("notes")}
                    className="text-right min-h-[80px] rounded-xl"
                    placeholder="הערות נוספות להצעה..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Financial Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card className="border-2 shadow-lg rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader className="bg-gradient-to-l from-purple-100 to-transparent border-b">
                  <CardTitle className="text-right text-xl text-purple-700">סיכום כספי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-3 text-right">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">סכום חלקי:</span>
                      <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-destructive">
                      <span>סה"כ הנחות:</span>
                      <span className="text-lg font-semibold">-{formatPrice(totalDiscount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background rounded-xl border">
                      <Label htmlFor="includeVAT-desktop" className="text-base font-medium cursor-pointer">
                        {includeVAT ? "כולל מע״מ" : "ללא מע״מ"}
                      </Label>
                      <Switch
                        id="includeVAT-desktop"
                        checked={form.watch("includeVAT")}
                        onCheckedChange={(checked) => form.setValue("includeVAT", checked)}
                      />
                    </div>

                    {includeVAT && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">מע״מ (18%):</span>
                        <span className="text-lg font-semibold">{formatPrice(vat)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-2xl font-bold text-purple-700">
                      <span>סה"כ לתשלום:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button type="submit" className="w-full rounded-xl h-12 text-lg" disabled={isCreating}>
                  {isCreating ? "שומר..." : "שמור הצעת מחיר"}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="flex items-center gap-2 rounded-xl h-11"
                  >
                    <Download className="h-4 w-4" />
                    הורד PDF
                  </Button>
                  <Button
                    type="button"
                    onClick={handleWhatsAppSend}
                    variant="default"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 rounded-xl h-11"
                  >
                    <MessageCircle className="h-4 w-4" />
                    וואטסאפ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && savedQuoteData && (
        <Card className="mt-8 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-right">תצוגה מקדימה - הצעת מחיר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-right">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold mb-2">הצעת מחיר</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>מספר הצעה:</strong> {savedQuoteData.quoteNumber}
                </div>
                <div>
                  <strong>תאריך:</strong> {new Date(savedQuoteData.date).toLocaleDateString('he-IL')}
                </div>
                <div>
                  <strong>תוקף עד:</strong> {new Date(savedQuoteData.validUntil).toLocaleDateString('he-IL')}
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">פרטי הלקוח</h3>
              <div className="space-y-1 text-sm">
                <div><strong>שם:</strong> {savedQuoteData.customer.fullName}</div>
                {savedQuoteData.customer.phone && <div><strong>טלפון:</strong> {savedQuoteData.customer.phone}</div>}
                {savedQuoteData.customer.email && <div><strong>אימייל:</strong> {savedQuoteData.customer.email}</div>}
                <div><strong>כתובת:</strong> {savedQuoteData.customer.address}, {savedQuoteData.customer.city}</div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">פירוט הפריטים</h3>
              {savedQuoteData.items.map((item, index) => (
                <div key={index} className="bg-muted/30 p-3 rounded-xl mb-2">
                  <div className="text-sm space-y-1">
                    <div><strong>פריט {index + 1}:</strong> {item.description}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>מחיר יחידה: {formatPrice(item.unitPrice)}</div>
                      <div>כמות: {item.quantity}</div>
                      <div>הנחה: {formatPrice(item.discount)}</div>
                    </div>
                    {item.notes && <div><strong>הערות:</strong> {item.notes}</div>}
                    <div className="font-semibold">סה"כ: {formatPrice(item.totalPrice)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-lg font-bold">
              <div className="flex justify-between">
                <span>{formatPrice(savedQuoteData.financial.total)}</span>
                <span>סה"כ לתשלום:</span>
              </div>
            </div>

            {savedQuoteData.terms && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">תנאים כלליים</h3>
                <p className="text-sm whitespace-pre-line">{savedQuoteData.terms}</p>
              </div>
            )}

            {savedQuoteData.notes && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">הערות</h3>
                <p className="text-sm whitespace-pre-line">{savedQuoteData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}