import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, Download, Send, Loader2, User, Car, DollarSign, Eye, Save, CheckCircle, FileText, CalendarIcon, PenLine } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileDocumentHeader } from "@/components/mobile/MobileDocumentHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CarSearchSelect } from "@/components/cars/CarSearchSelect";
import { CustomerAndLeadSearchSelect } from "@/components/customers/CustomerAndLeadSearchSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useProfile } from "@/hooks/use-profile";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SalesAgreementPreview } from "@/components/sales-agreement/SalesAgreementPreview";
import { generateSalesAgreementPDF } from "@/utils/pdf/sales-agreement-pdf";
import { useCustomers, useCreateCustomerDocument } from "@/hooks/customers";
import { useAddCustomerVehiclePurchase } from "@/hooks/customers/use-customer-vehicles";
import { useUploadProductionDocument } from "@/hooks/use-upload-production-document";
import { formatPhoneForWhatsApp } from "@/utils/phone-utils";
import { Label } from "@/components/ui/label";
import { SignatureDialog } from "@/components/signature/SignatureDialog";

const salesAgreementSchema = z.object({
  date: z.date({
    required_error: "תאריך נדרש"
  }),
  leadId: z.string().optional(),
  carId: z.string().optional(),
  buyerName: z.string({
    required_error: "שם קונה נדרש"
  }),
  buyerId: z.string({
    required_error: "תעודת זהות קונה נדרשת"
  }),
  buyerPhone: z.string().optional(),
  buyerAddress: z.string({
    required_error: "כתובת קונה נדרשת"
  }),
  totalPrice: z.string({
    required_error: "מחיר כולל נדרש"
  }),
  downPayment: z.string({
    required_error: "מקדמה נדרשת"
  }),
  remainingAmount: z.string().optional(),
  paymentTerms: z.string().optional(),
  specialTerms: z.string().optional(),
});

type SalesAgreementFormData = z.infer<typeof salesAgreementSchema>;

export default function SalesAgreement() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  const [signatures, setSignatures] = useState<{ seller?: string; buyer?: string }>({});
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const { leads = [] } = useLeads();
  const { cars = [] } = useCars();
  const { profile } = useProfile();
  const { data: customers = [] } = useCustomers();
  const createCustomerDocument = useCreateCustomerDocument();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();
  const addPurchase = useAddCustomerVehiclePurchase();
  const isMobile = useIsMobile();

  const form = useForm<SalesAgreementFormData>({
    resolver: zodResolver(salesAgreementSchema),
    defaultValues: {
      date: new Date(),
      buyerName: '',
      buyerId: '',
      buyerPhone: '',
      buyerAddress: '',
      totalPrice: '',
      downPayment: '',
    },
  });

  const selectedCarId = form.watch("carId");
  const selectedCar = cars.find(car => car.id === selectedCarId);
  const totalPrice = form.watch("totalPrice");
  const downPayment = form.watch("downPayment");

  // Calculate remaining amount
  const remainingAmount = totalPrice && downPayment 
    ? parseFloat(totalPrice) - parseFloat(downPayment)
    : 0;

  // Handle entity selection (customer or lead)
  const handleEntitySelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity({ type: value.type, id: value.id });
    
    if (value.type === 'customer') {
      form.setValue('buyerName', value.data.full_name || '');
      form.setValue('buyerId', value.data.id_number || '');
      form.setValue('buyerPhone', value.data.phone || '');
      form.setValue('buyerAddress', value.data.address || '');
    } else {
      form.setValue('buyerName', value.data.name || '');
      form.setValue('buyerPhone', value.data.phone || '');
      form.setValue('buyerId', '');
      form.setValue('buyerAddress', '');
    }
  };

  // Create preview data
  const previewData = {
    date: form.watch("date"),
    signatures,
    seller: {
      company: profile?.company_name || profile?.full_name || "",
      id: profile?.company_hp || "",
      phone: profile?.phone || "",
      address: {
        street: profile?.company_address || "",
        city: "",
        country: "ישראל"
      }
    },
    buyer: form.watch("buyerName") ? {
      name: form.watch("buyerName"),
      id: form.watch("buyerId"),
      phone: form.watch("buyerPhone") || "",
      address: form.watch("buyerAddress")
    } : undefined,
    car: selectedCar ? {
      make: selectedCar.make,
      model: selectedCar.model,
      licenseNumber: selectedCar.license_number || "",
      chassisNumber: selectedCar.chassis_number || "",
      year: selectedCar.year,
      mileage: selectedCar.kilometers,
      hand: "1",
      originality: "מקורית"
    } : undefined,
    financial: {
      totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
      downPayment: downPayment ? parseFloat(downPayment) : undefined,
      remainingAmount: remainingAmount || undefined,
      paymentTerms: form.watch("paymentTerms"),
      specialTerms: form.watch("specialTerms")
    }
  };

  const onSubmit = async (data: SalesAgreementFormData) => {
    try {
      setIsGenerating(true);

      const agreementData = {
        date: format(data.date, "dd MMMM yyyy", { locale: he }),
        seller: {
          company: profile?.company_name || profile?.full_name || "",
          id: profile?.company_hp || "",
          phone: profile?.phone || "",
          address: {
            street: profile?.company_address || "",
            city: "",
            country: "ישראל"
          }
        },
        buyer: {
          name: data.buyerName,
          id: data.buyerId,
          phone: data.buyerPhone || "",
          address: data.buyerAddress
        },
        car: selectedCar ? {
          make: selectedCar.make,
          model: selectedCar.model,
          licenseNumber: selectedCar.license_number || "",
          chassisNumber: selectedCar.chassis_number || "",
          year: selectedCar.year,
          mileage: selectedCar.kilometers,
          hand: "1",
          originality: "מקורית"
        } : undefined,
        financial: {
          totalPrice: parseFloat(data.totalPrice),
          downPayment: parseFloat(data.downPayment),
          remainingAmount: data.remainingAmount ? parseFloat(data.remainingAmount) : parseFloat(data.totalPrice) - parseFloat(data.downPayment),
          paymentTerms: data.paymentTerms || "",
          specialTerms: data.specialTerms || ""
        },
        signatures: signatures.seller || signatures.buyer ? signatures : undefined,
      };

      // Generate and download PDF
      await generateSalesAgreementPDF(agreementData);

      // Upload PDF to storage
      try {
        const pdfBlob = await generateSalesAgreementPDF(agreementData, true) as Blob;
        if (pdfBlob) {
          const publicUrl = await uploadDocument({
            pdfBlob,
            documentType: 'sales_agreement',
            documentNumber: format(data.date, 'yyyyMMdd'),
            customerName: data.buyerName,
            entityType: selectedEntity?.type === 'customer' ? 'customer' : 'lead',
            entityId: selectedEntity?.id,
          });
          if (publicUrl) {
            setDocumentUrl(publicUrl);
          }
        }
      } catch (pdfError) {
        console.error('Error uploading PDF:', pdfError);
      }

      // Attach the agreement to an existing customer when possible
      if (selectedEntity?.type === 'customer') {
        createCustomerDocument.mutate({
          customerId: selectedEntity.id,
          title: 'הסכם מכר',
          type: 'contract',
          amount: parseFloat(data.totalPrice),
          date: format(data.date, 'yyyy-MM-dd')
        });

        // Create vehicle purchase record for customer ledger/balance tracking
        if (selectedCarId) {
          addPurchase.mutate({
            customerId: selectedEntity.id,
            carId: selectedCarId,
            purchasePrice: parseFloat(data.totalPrice),
            purchaseDate: format(data.date, 'yyyy-MM-dd'),
          });
        }
      }
      
      toast({
        title: "הצלחה",
        description: "הסכם המכר נוצר בהצלחה"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת ההסכם",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppSend = () => {
    const buyerPhone = form.getValues('buyerPhone');
    const buyerName = form.getValues('buyerName');
    
    if (!buyerPhone) {
      toast({
        title: "שגיאה",
        description: "לא הוזן מספר טלפון",
        variant: "destructive"
      });
      return;
    }
    
    let message = `שלום ${buyerName}, מצורף הסכם המכר עבור הרכב.`;
    
    if (documentUrl) {
      message += `\n\n📄 לצפייה והורדת המסמך:\n${documentUrl}`;
    }
    
    message += `\n\nנשמח לקבוע פגישה לחתימה על ההסכם.`;
    
    const formattedPhone = formatPhoneForWhatsApp(buyerPhone);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileContainer withPadding={false} withBottomNav={true}>
        <MobileDocumentHeader 
          title="הסכם מכר" 
          icon={<FileText className="h-5 w-5" />}
        />
        
        <div className="p-4 space-y-4 pb-56">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* General Info Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    מידע כללי
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Date Selection */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">תאריך ההסכם</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button 
                                variant="outline" 
                                className="w-full h-11 text-right font-normal justify-start rounded-xl text-sm"
                              >
                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: he }) : "בחר תאריך"}
                                <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm">בחירת לקוח</Label>
                    <CustomerAndLeadSearchSelect
                      value={selectedEntity}
                      onValueChange={handleEntitySelect}
                      placeholder="חפש לקוח או ליד..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Details Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-blue-500/10 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    פרטי הקונה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <FormField
                    control={form.control}
                    name="buyerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">שם מלא</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="שם הקונה" className="text-right h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="buyerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">ת.ז</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="תעודת זהות" className="text-right h-10 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="buyerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">טלפון</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="טלפון" className="text-right h-10 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="buyerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">כתובת</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="כתובת מלאה" className="text-right h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Vehicle Selection Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-green-500/10 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    פרטי הרכב
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <FormField
                    control={form.control}
                    name="carId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">בחירת רכב</FormLabel>
                        <CarSearchSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="בחר רכב מהמלאי"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedCar && (
                    <div className="p-3 bg-muted/50 rounded-xl space-y-1 text-sm">
                      <p className="font-medium">{selectedCar.make} {selectedCar.model} ({selectedCar.year})</p>
                      <p className="text-muted-foreground">ק"מ: {selectedCar.kilometers?.toLocaleString()}</p>
                      {selectedCar.license_number && (
                        <p className="text-muted-foreground">מס' רישוי: {selectedCar.license_number}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Details Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-amber-500/10 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    פרטים כספיים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <FormField
                    control={form.control}
                    name="totalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">מחיר כולל (₪)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0" className="text-right h-11 rounded-xl text-lg font-semibold" type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">מקדמה (₪)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0" className="text-right h-10 rounded-xl" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <Label className="text-sm">יתרה לתשלום</Label>
                      <div className="h-10 flex items-center justify-end px-3 bg-muted/50 rounded-xl font-medium">
                        ₪{remainingAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-purple-500/10 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    תנאים והערות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">תנאי תשלום</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="הכנס תנאי תשלום..."
                            className="text-right min-h-[80px] resize-none rounded-xl"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">תנאים מיוחדים</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="הכנס תנאים מיוחדים (אופציונלי)..."
                            className="text-right min-h-[80px] resize-none rounded-xl"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        {/* Fixed Mobile Action Bar */}
        <div className="fixed bottom-36 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-50">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSignatureDialogOpen(true)}
              className="h-11 px-4 rounded-xl"
            >
              <PenLine className="h-5 w-5" />
              {signatures.seller || signatures.buyer ? '✓' : ''}
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isGenerating}
              className="flex-1 h-11 rounded-xl shadow-lg"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin ml-2" />
              ) : (
                <Download className="h-5 w-5 ml-2" />
              )}
              {isGenerating ? "יוצר..." : "הפק PDF"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleWhatsAppSend}
              disabled={!form.watch('buyerPhone') || !documentUrl}
              title={!documentUrl ? 'יש להפיק PDF קודם' : 'שלח בוואטסאפ'}
              className="h-11 px-4 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Signature Dialog */}
        <SignatureDialog
          open={signatureDialogOpen}
          onOpenChange={setSignatureDialogOpen}
          onSignaturesComplete={setSignatures}
          existingSignatures={signatures}
        />
      </MobileContainer>
    );
  }

  // Desktop Layout
  return (
    <div className="w-full max-w-none space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Section - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* General Info Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b">
                  <CardTitle className="text-right flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    הסכם מכר - פרטים כלליים
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-right">תאריך ההסכם</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-12 pl-3 text-right font-normal rounded-xl",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: he })
                                  ) : (
                                    <span>בחר תאריך</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date("1900-01-01")}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Customer Selection */}
                    <div className="space-y-2">
                      <Label>בחירת לקוח</Label>
                      <CustomerAndLeadSearchSelect
                        value={selectedEntity}
                        onValueChange={handleEntitySelect}
                        placeholder="חפש לקוח או ליד..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Details Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-blue-500/10 to-transparent border-b">
                  <CardTitle className="text-right flex items-center gap-2">
                    <User className="h-5 w-5" />
                    פרטי הקונה
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="buyerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">שם מלא</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם הקונה" className="text-right h-12 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="buyerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">תעודת זהות</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס תעודת זהות" className="text-right h-12 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="buyerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">טלפון</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס טלפון" className="text-right h-12 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="buyerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">כתובת</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס כתובת מלאה" className="text-right h-12 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Selection Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-green-500/10 to-transparent border-b">
                  <CardTitle className="text-right flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    פרטי הרכב
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="carId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right">בחירת רכב מהמלאי</FormLabel>
                        <CarSearchSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="בחר רכב"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedCar && (
                    <Card className="mt-4 border-green-200 bg-green-50/50 rounded-xl">
                      <CardContent className="pt-4 text-right space-y-2">
                        <p className="font-semibold text-lg">{selectedCar.make} {selectedCar.model}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p>שנת ייצור: {selectedCar.year}</p>
                          <p>ק"מ: {selectedCar.kilometers?.toLocaleString()}</p>
                          {selectedCar.license_number && <p>מס' רישוי: {selectedCar.license_number}</p>}
                          {selectedCar.chassis_number && <p>מס' שילדה: {selectedCar.chassis_number}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Terms Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-purple-500/10 to-transparent border-b">
                  <CardTitle className="text-right flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    תנאים והערות
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right">תנאי תשלום</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="הכנס תנאי תשלום (מועדי תשלום, תנאים מיוחדים וכו')"
                            className="text-right min-h-[100px] resize-none rounded-xl"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right">תנאים מיוחדים</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="הכנס תנאים מיוחדים (אופציונלי)"
                            className="text-right min-h-[100px] resize-none rounded-xl"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        {/* Sticky Financial Summary & Preview - Right Column */}
        <div className="xl:sticky xl:top-6 space-y-6 h-fit">
          {/* Financial Summary Card */}
          <Card className="shadow-xl rounded-2xl border-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-bl from-purple-600 to-indigo-700 text-white">
              <CardTitle className="text-right flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                סיכום כספי
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">מחיר כולל (₪)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0" className="text-right h-12 rounded-xl text-lg font-semibold" type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">מקדמה (₪)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0" className="text-right h-12 rounded-xl" type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-muted-foreground">מקדמה</span>
                  <span>₪{(parseFloat(downPayment) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>יתרה לתשלום</span>
                  <span className="text-primary">₪{remainingAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSignatureDialogOpen(true)}
                  className="w-full h-10 rounded-xl"
                >
                  <PenLine className="ml-2 h-4 w-4" />
                  {signatures.seller || signatures.buyer ? 'חתימות נשמרו ✓' : 'חתימה דיגיטלית'}
                </Button>

                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isGenerating}
                  className="w-full h-12 rounded-xl shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      יוצר הסכם...
                    </>
                  ) : (
                    <>
                      <Download className="ml-2 h-5 w-5" />
                      הפק PDF
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWhatsAppSend}
                  disabled={!form.watch('buyerPhone') || !documentUrl}
                  title={!documentUrl ? 'יש להפיק PDF קודם' : 'שלח בוואטסאפ'}
                  className="w-full h-10 rounded-xl"
                >
                  <Send className="ml-2 h-4 w-4" />
                  שלח בוואטסאפ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {(previewData.buyer || previewData.car) && (
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="border-b">
                <CardTitle className="text-right flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5" />
                  תצוגה מקדימה
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <SalesAgreementPreview data={previewData} />
              </CardContent>
            </Card>
          )}

          {/* Signature Dialog */}
          <SignatureDialog
            open={signatureDialogOpen}
            onOpenChange={setSignatureDialogOpen}
            onSignaturesComplete={setSignatures}
            existingSignatures={signatures}
          />
        </div>
      </div>
    </div>
  );
}
