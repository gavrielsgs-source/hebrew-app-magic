import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Download, UserPlus, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CustomerAndLeadSearchSelect } from "@/components/customers/CustomerAndLeadSearchSelect";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/customers";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileDocumentHeader } from "@/components/mobile/MobileDocumentHeader";
import { useNewCarOrder } from "@/hooks/use-new-car-order";
import { useUploadProductionDocument } from "@/hooks/use-upload-production-document";
import { generateNewCarOrderPDF, type NewCarOrderPDFData } from "@/utils/pdf/new-car-order-pdf";
import { useProfile } from "@/hooks/use-profile";

const newCarOrderSchema = z.object({
  date: z.string().min(1, "תאריך נדרש"),
  leadId: z.string().optional(),
  customer: z.object({
    fullName: z.string().min(2, "שם מלא נדרש"),
    firstName: z.string().min(2, "שם פרטי נדרש"),
    birthYear: z.string().regex(/^\d{4}$/, "שנת לידה תקינה נדרשת"),
    idNumber: z.string().min(9, "תעודת זהות תקינה נדרשת"),
    city: z.string().min(2, "עיר נדרשת"),
    address: z.string().min(2, "כתובת נדרשת"),
    phone: z.string().optional(),
  }),
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, "תיאור נדרש"),
    netPrice: z.number().min(0, "מחיר נטו חייב להיות חיובי"),
    discount: z.number().min(0, "הנחה חייבת להיות חיובית"),
    quantity: z.number().min(1, "כמות חייבת להיות לפחות 1"),
    finalPrice: z.number().min(0, "מחיר סופי חייב להיות חיובי"),
  })).min(1, "חובה להוסיף לפחות פריט אחד"),
  notes: z.string().optional(),
});

type NewCarOrderFormValues = z.infer<typeof newCarOrderSchema>;

export default function NewCarOrder() {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [useExisting, setUseExisting] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [savedOrderData, setSavedOrderData] = useState<NewCarOrderPDFData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const { leads } = useLeads();
  const { data: customers = [] } = useCustomers();
  const isMobile = useIsMobile();
  const { createOrder, isCreating } = useNewCarOrder();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();
  const { profile } = useProfile();

  const form = useForm<NewCarOrderFormValues>({
    resolver: zodResolver(newCarOrderSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      leadId: "",
      customer: {
        fullName: "",
        firstName: "",
        birthYear: "",
        idNumber: "",
        city: "",
        address: "",
        phone: "",
      },
      items: [{
        id: "1",
        description: "",
        netPrice: 0,
        discount: 0,
        quantity: 1,
        finalPrice: 0,
      }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const selectedDate = form.watch("date") ? new Date(form.watch("date")) : undefined;
  
  const subtotal = watchedItems.reduce((sum, item) => sum + (item.netPrice * item.quantity), 0);
  const totalDiscount = watchedItems.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - totalDiscount;
  const vatAmount = includeVAT ? total * 0.18 : 0;
  const grandTotal = total + vatAmount;

  const addItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      netPrice: 0,
      discount: 0,
      quantity: 1,
      finalPrice: 0,
    });
  };

  const calculateFinalPrice = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const finalPrice = (item.netPrice * item.quantity) - item.discount;
      form.setValue(`items.${index}.finalPrice`, Math.max(0, finalPrice));
    }
  };

  const handleLeadSelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity(value);
    
    if (value.type === 'lead') {
      form.setValue("leadId", value.id);
      form.setValue("customer.fullName", value.data.name || "");
      form.setValue("customer.firstName", value.data.name?.split(" ")[0] || "");
      form.setValue("customer.phone", value.data.phone || "");
    } else {
      form.setValue("leadId", undefined);
      form.setValue("customer.fullName", value.data.full_name || "");
      form.setValue("customer.firstName", value.data.full_name?.split(" ")[0] || "");
      form.setValue("customer.idNumber", value.data.id_number || "");
      form.setValue("customer.city", value.data.city || "");
      form.setValue("customer.address", value.data.address || "");
      form.setValue("customer.phone", value.data.phone || "");
    }
  };

  const buildOrderData = (formData: NewCarOrderFormValues): Omit<NewCarOrderPDFData, 'orderNumber'> => ({
    date: formData.date,
    customer: {
      fullName: formData.customer.fullName,
      firstName: formData.customer.firstName,
      birthYear: formData.customer.birthYear,
      idNumber: formData.customer.idNumber,
      city: formData.customer.city,
      address: formData.customer.address,
      phone: formData.customer.phone,
    },
    items: formData.items.map(item => ({
      description: item.description,
      netPrice: item.netPrice,
      discount: item.discount,
      quantity: item.quantity,
      finalPrice: item.finalPrice,
    })),
    financial: {
      subtotal,
      totalDiscount,
      vat: includeVAT ? vatAmount : undefined,
      total: grandTotal,
    },
    includeVAT,
    notes: formData.notes,
    company: profile ? {
      name: profile.company_name || '',
      address: profile.company_address || '',
      hp: profile.company_hp || '',
      phone: profile.phone || '',
      authorizedDealer: profile.company_authorized_dealer || false,
      logoUrl: profile.company_logo_url || undefined,
    } : undefined,
  });

  const onSubmit = async (data: NewCarOrderFormValues) => {
    try {
      const orderPayload = buildOrderData(data);
      const result = await createOrder(orderPayload);
      setSavedOrderData(result);
      setIsSaved(true);

      toast({
        title: "הזמנת הרכב נשמרה בהצלחה",
        description: `מספר הזמנה: ${result.orderNumber}`,
      });

      // Generate and upload PDF
      try {
        const pdfBlob = await generateNewCarOrderPDF(result, true) as Blob;
        if (pdfBlob) {
          const publicUrl = await uploadDocument({
            pdfBlob,
            documentType: 'new_car_order',
            documentNumber: result.orderNumber,
            customerName: result.customer?.fullName || '',
            entityType: selectedEntity?.type === 'customer' ? 'customer' : 'lead',
            entityId: selectedEntity?.id,
          });
          if (publicUrl) setDocumentUrl(publicUrl);
        }
      } catch (pdfError) {
        console.error('Error uploading PDF:', pdfError);
      }

      setShowPreview(true);
    } catch (error) {
      console.error("Error saving car order:", error);
      toast({
        title: "שגיאה בשמירת ההזמנה",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    const formData = form.getValues();
    const orderData: NewCarOrderPDFData = savedOrderData || {
      orderNumber: "טיוטה",
      ...buildOrderData(formData),
    };
    await generateNewCarOrderPDF(orderData);
  };

  const handleWhatsAppSend = () => {
    const formData = form.getValues();
    const customerData = savedOrderData?.customer || formData.customer;
    const orderNumber = savedOrderData?.orderNumber || "טיוטה";
    const totalAmount = savedOrderData?.financial.total || grandTotal;

    let message = `שלום ${customerData.firstName || customerData.fullName},\n\nהזמנת רכב חדש מספר: ${orderNumber}\nסכום: ${totalAmount.toFixed(2)} ₪`;

    if (documentUrl) {
      message += `\n\n📄 לצפייה והורדת הקובץ:\n${documentUrl}`;
    }

    message += '\n\nנשמח לעמוד לרשותך!';

    let phone = customerData.phone?.replace(/[^\d]/g, '');

    if (phone) {
      if (phone.startsWith('0')) {
        phone = '972' + phone.slice(1);
      } else if (!phone.startsWith('972')) {
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

  // ─── Financial Summary Card (shared) ───
  const FinancialSummaryCard = ({ sticky = false }: { sticky?: boolean }) => (
    <Card className={cn(
      "shadow-lg rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
      sticky && "sticky top-6"
    )}>
      <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
        <CardTitle className="text-lg text-right">סיכום כספי</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <Switch checked={includeVAT} onCheckedChange={setIncludeVAT} dir="ltr" />
          <span className="text-sm font-medium">כולל מע"מ (18%)</span>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">{formatPrice(subtotal)}</span>
            <span>סה"כ לפני הנחה</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-destructive">
              <span className="font-semibold">-{formatPrice(totalDiscount)}</span>
              <span>הנחה</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold">{formatPrice(total)}</span>
            <span>סה"כ</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">{formatPrice(vatAmount)}</span>
            <span>מע"מ (18%)</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center text-lg font-bold text-primary">
          <span>{formatPrice(grandTotal)}</span>
          <span>סה"כ לתשלום</span>
        </div>
      </CardContent>
    </Card>
  );

  // ─── Mobile Layout ───
  if (isMobile) {
    return (
      <MobileContainer withBottomNav={true}>
        <MobileDocumentHeader 
          title="הזמנת רכב חדש"
          icon={<FileText className="h-5 w-5" />}
        />

        {isSaved && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">נשמר בענן</span>
          </div>
        )}
        
        <div className="p-4 space-y-4 pb-44">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <CardTitle className="text-right text-lg">תאריך ההזמנה</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-right font-normal h-11 rounded-xl",
                        !form.watch("date") && "text-muted-foreground"
                      )}
                    >
                      <span>{form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('he-IL') : "בחר תאריך"}</span>
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" side="bottom">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) form.setValue("date", date.toISOString().split('T')[0]);
                      }}
                      initialFocus
                      dir="rtl"
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Customer */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <CardTitle className="text-right text-lg">פרטי הלקוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex gap-2">
                  <Button type="button" variant={useExisting ? "default" : "outline"} size="sm" onClick={() => setUseExisting(true)} className="flex-1 h-10 rounded-xl">
                    בחר לקוח קיים
                  </Button>
                  <Button type="button" variant={!useExisting ? "default" : "outline"} size="sm" onClick={() => { setUseExisting(false); form.setValue("leadId", undefined); setSelectedEntity(null); }} className="flex-1 h-10 rounded-xl flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    לקוח חדש
                  </Button>
                </div>

                {useExisting && (
                  <CustomerAndLeadSearchSelect value={selectedEntity} onValueChange={handleLeadSelect} placeholder="חפש לקוח או ליד..." />
                )}
                
                <div className="space-y-3">
                  <Input {...form.register("customer.fullName")} className="text-right h-11 rounded-xl" placeholder="שם מלא" />
                  {form.formState.errors.customer?.fullName && <p className="text-sm text-destructive">{form.formState.errors.customer.fullName.message}</p>}
                  <Input {...form.register("customer.firstName")} className="text-right h-11 rounded-xl" placeholder="שם פרטי" />
                  <Input {...form.register("customer.phone")} className="text-right h-11 rounded-xl" placeholder="טלפון" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input {...form.register("customer.birthYear")} className="text-right h-10 rounded-xl" placeholder="שנת לידה" />
                    <Input {...form.register("customer.idNumber")} className="text-right h-10 rounded-xl" placeholder="תעודת זהות" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input {...form.register("customer.city")} className="text-right h-10 rounded-xl" placeholder="עיר" />
                    <Input {...form.register("customer.address")} className="text-right h-10 rounded-xl" placeholder="כתובת" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <div className="flex items-center justify-between">
                  <Button type="button" size="sm" onClick={addItem} className="h-8 rounded-xl">
                    <Plus className="h-4 w-4 ml-1" />
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
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="h-7 px-2 rounded-lg" disabled={fields.length === 1}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <span className="font-medium text-sm">פריט {index + 1}</span>
                      </div>
                      <Input {...form.register(`items.${index}.description`)} className="text-right h-10 rounded-xl" placeholder="תיאור הפריט" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">מחיר נטו</Label>
                          <Input type="number" {...form.register(`items.${index}.netPrice`, { valueAsNumber: true, onChange: () => calculateFinalPrice(index) })} className="text-right h-10 rounded-xl" placeholder="0" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">הנחה</Label>
                          <Input type="number" {...form.register(`items.${index}.discount`, { valueAsNumber: true, onChange: () => calculateFinalPrice(index) })} className="text-right h-10 rounded-xl" placeholder="0" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">כמות</Label>
                          <Input type="number" min="1" {...form.register(`items.${index}.quantity`, { valueAsNumber: true, onChange: () => calculateFinalPrice(index) })} className="text-right h-10 rounded-xl" placeholder="1" />
                        </div>
                      </div>
                      <div className="p-2 bg-primary/5 rounded-lg text-center font-semibold text-sm">
                        מחיר סופי: {formatPrice(watchedItems[index]?.finalPrice || 0)}
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <CardTitle className="text-right text-lg">הערות</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea {...form.register("notes")} className="text-right min-h-[80px] rounded-xl" placeholder="הערות נוספות להזמנה..." />
              </CardContent>
            </Card>

            {/* Summary */}
            <FinancialSummaryCard />

            {/* Fixed Action Buttons */}
            <div className="fixed bottom-36 left-0 right-0 p-3 bg-background border-t shadow-lg z-50">
              <div className="space-y-1.5 max-w-md mx-auto">
                <Button type="submit" disabled={isCreating || isUploading} className="w-full h-11 rounded-xl text-base font-bold bg-green-600 hover:bg-green-700">
                  <FileText className="ml-2 h-5 w-5" />
                  {isCreating ? 'שומר...' : 'הפק מסמך'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={handleDownloadPDF} className="h-9 rounded-xl">
                    <Download className="ml-1 h-4 w-4" />
                    PDF
                  </Button>
                  <Button type="button" onClick={handleWhatsAppSend} disabled={!documentUrl} title={!documentUrl ? 'יש לשמור את המסמך קודם' : 'שלח בוואטסאפ'} className="h-9 rounded-xl bg-green-600 hover:bg-green-700">
                    <MessageCircle className="ml-1 h-4 w-4" />
                    וואטסאפ
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </MobileContainer>
    );
  }

  // ─── Desktop Layout ───
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl" dir="rtl">
      {/* Page Header - aligned right like PriceQuote */}
      <div className="mb-8 text-right">
        <h1 className="text-4xl font-bold bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent mb-2">
          הזמנת רכב חדש
        </h1>
        <p className="text-muted-foreground text-lg">
          מילוי פרטי הזמנת רכב חדש ללקוח
        </p>
      </div>

      {/* Save Status Indicator */}
      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">ההזמנה נשמרה בענן</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Card */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <CardTitle className="text-lg text-right">תאריך ההזמנה</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full max-w-xs justify-between text-right font-normal h-10 rounded-xl",
                        !form.watch("date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                      <span>{form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('he-IL') : "בחר תאריך"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end" side="bottom">
                    <Calendar mode="single" selected={selectedDate} onSelect={(date) => { if (date) form.setValue("date", date.toISOString().split('T')[0]); }} initialFocus dir="rtl" className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button type="button" variant={useExisting ? "default" : "outline"} size="sm" onClick={() => setUseExisting(true)} className="rounded-xl">
                      בחר לקוח קיים
                    </Button>
                    <Button type="button" variant={!useExisting ? "default" : "outline"} size="sm" onClick={() => { setUseExisting(false); form.setValue("leadId", undefined); setSelectedEntity(null); }} className="rounded-xl flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      לקוח חדש
                    </Button>
                  </div>
                  <CardTitle className="text-lg">פרטי הלקוח</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {useExisting && (
                  <CustomerAndLeadSearchSelect value={selectedEntity} onValueChange={handleLeadSelect} placeholder="חפש לקוח או ליד..." />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">שם מלא</Label>
                    <Input {...form.register("customer.fullName")} className="text-right h-10 rounded-xl" placeholder="שם מלא" />
                    {form.formState.errors.customer?.fullName && <p className="text-sm text-destructive">{form.formState.errors.customer.fullName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">שם פרטי</Label>
                    <Input {...form.register("customer.firstName")} className="text-right h-10 rounded-xl" placeholder="שם פרטי" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">טלפון</Label>
                    <Input {...form.register("customer.phone")} className="text-right h-10 rounded-xl" placeholder="050-1234567" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">שנת לידה</Label>
                    <Input {...form.register("customer.birthYear")} className="text-right h-10 rounded-xl" placeholder="1990" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">תעודת זהות</Label>
                    <Input {...form.register("customer.idNumber")} className="text-right h-10 rounded-xl" placeholder="123456789" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">עיר</Label>
                    <Input {...form.register("customer.city")} className="text-right h-10 rounded-xl" placeholder="תל אביב" />
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                    <Label className="text-sm">כתובת</Label>
                    <Input {...form.register("customer.address")} className="text-right h-10 rounded-xl" placeholder="הכנס כתובת" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <div className="flex items-center justify-between">
                  <Button type="button" size="sm" onClick={addItem} className="rounded-xl">
                    <Plus className="h-4 w-4 ml-1" />
                    הוסף פריט
                  </Button>
                  <CardTitle className="text-lg">פריטים</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-muted/30 rounded-xl border">
                    <div className="flex items-center justify-between mb-3">
                      <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="h-8 px-3 rounded-lg" disabled={fields.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <h4 className="font-medium">פריט {index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-1 lg:col-span-2">
                        <Label className="text-sm">תיאור</Label>
                        <Input {...form.register(`items.${index}.description`)} className="text-right h-10 rounded-xl" placeholder="תיאור הפריט" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">מחיר נטו</Label>
                        <Input type="number" {...form.register(`items.${index}.netPrice`, { valueAsNumber: true, onChange: () => calculateFinalPrice(index) })} className="text-right h-10 rounded-xl" placeholder="0" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">הנחה</Label>
                        <Input type="number" {...form.register(`items.${index}.discount`, { valueAsNumber: true, onChange: () => calculateFinalPrice(index) })} className="text-right h-10 rounded-xl" placeholder="0" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">כמות</Label>
                        <Input type="number" min="1" {...form.register(`items.${index}.quantity`, { valueAsNumber: true, onChange: () => calculateFinalPrice(index) })} className="text-right h-10 rounded-xl" placeholder="1" />
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-primary/5 rounded-xl text-center">
                      <span className="text-lg font-bold text-primary">
                        מחיר סופי: {formatPrice(watchedItems[index]?.finalPrice || 0)}
                      </span>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                <CardTitle className="text-lg text-right">הערות</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea {...form.register("notes")} className="text-right min-h-[100px] rounded-xl" placeholder="הערות נוספות להזמנה..." />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <FinancialSummaryCard />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isCreating || isUploading}
                  className="w-full h-14 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700"
                >
                  <FileText className="ml-2 h-5 w-5" />
                  {isCreating ? 'שומר...' : 'הפק מסמך'}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="h-12 rounded-xl"
                  >
                    <Download className="ml-2 h-5 w-5" />
                    הורד PDF
                  </Button>
                  <Button
                    type="button"
                    onClick={handleWhatsAppSend}
                    disabled={!documentUrl}
                    title={!documentUrl ? 'יש לשמור את המסמך קודם' : 'שלח בוואטסאפ'}
                    className="h-12 rounded-xl bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="ml-2 h-5 w-5" />
                    וואטסאפ
                  </Button>
                </div>
              </div>

              {/* Preview Section */}
              {showPreview && savedOrderData && (
                <Card className="shadow-lg rounded-2xl border-2">
                  <CardHeader className="bg-gradient-to-l from-green-500/10 to-transparent border-b pb-3">
                    <CardTitle className="text-lg text-right">✅ ההזמנה נשמרה</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-right text-sm">
                    <p><strong>מספר הזמנה:</strong> {savedOrderData.orderNumber}</p>
                    <p><strong>תאריך:</strong> {new Date(savedOrderData.date).toLocaleDateString('he-IL')}</p>
                    <p><strong>לקוח:</strong> {savedOrderData.customer.fullName}</p>
                    <p><strong>סה"כ לתשלום:</strong> {formatPrice(savedOrderData.financial.total)}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
