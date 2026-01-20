import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, MessageCircle, FileText, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { CustomerAndLeadSearchSelect } from '@/components/customers/CustomerAndLeadSearchSelect';
import { useCustomers } from '@/hooks/customers';
import { useProfile } from '@/hooks/use-profile';
import { generateTaxInvoiceCreditPDF } from '@/utils/tax-invoice-credit-pdf-generator';
import { useTaxInvoiceCredit } from '@/hooks/tax-invoice-credit/use-tax-invoice-credit';
import type { TaxInvoiceCreditData, OriginalInvoice } from '@/types/tax-invoice-credit';
import { formatPhoneForWhatsApp } from '@/utils/phone-utils';
import { useUploadProductionDocument } from '@/hooks/use-upload-production-document';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { MobileDocumentHeader } from '@/components/mobile/MobileDocumentHeader';

const taxInvoiceCreditSchema = z.object({
  date: z.date({ required_error: 'תאריך נדרש' }),
  title: z.string().min(1, 'כותרת נדרשת'),
  
  // Company info
  companyName: z.string().min(1, 'שם החברה נדרש'),
  companyAddress: z.string().min(1, 'כתובת החברה נדרשת'),
  companyHp: z.string().min(1, 'מספר עוסק מורשה נדרש'),
  companyPhone: z.string().min(1, 'טלפון החברה נדרש'),
  companyAuthorizedDealer: z.boolean(),
  
  // Customer info
  customerName: z.string().min(1, 'שם הלקוח נדרש'),
  customerAddress: z.string().min(1, 'כתובת הלקוח נדרשת'),
  customerHp: z.string().min(1, 'ח.פ/ת.ז הלקוח נדרש'),
  customerPhone: z.string().min(1, 'טלפון הלקוח נדרש'),

  // Credit for type
  creditForType: z.enum(['tax_invoice', 'tax_invoice_receipt']),

  // Allocation
  allocationMode: z.enum(['manual', 'request']),
  allocationNumber: z.string().optional(),

  // Notes
  notes: z.string().optional(),
});

type TaxInvoiceCreditFormData = z.infer<typeof taxInvoiceCreditSchema>;

export default function TaxInvoiceCredit() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedCreditData, setSavedCreditData] = useState<TaxInvoiceCreditData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<OriginalInvoice | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(new Date(new Date().getFullYear(), 0, 1));
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const { data: customers = [] } = useCustomers();
  const { profile } = useProfile();
  const { createTaxInvoiceCredit, isCreating, useFetchOriginalInvoices } = useTaxInvoiceCredit();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();

  const form = useForm<TaxInvoiceCreditFormData>({
    resolver: zodResolver(taxInvoiceCreditSchema),
    defaultValues: {
      date: new Date(),
      title: 'חשבונית מס זיכוי',
      companyName: profile?.company_name || '',
      companyAddress: '',
      companyHp: '',
      companyPhone: profile?.phone || '',
      companyAuthorizedDealer: false,
      customerName: '',
      customerAddress: '',
      customerHp: '',
      customerPhone: '',
      creditForType: 'tax_invoice',
      allocationMode: 'manual',
      allocationNumber: '',
      notes: ''
    }
  });

  const watchedFields = form.watch();
  const creditForType = form.watch('creditForType');

  // Fetch original invoices based on selected customer and date range
  const { data: originalInvoices = [], isLoading: isLoadingInvoices } = useFetchOriginalInvoices(
    selectedEntity?.type === 'customer' ? selectedEntity.id : null,
    fromDate,
    toDate,
    creditForType
  );

  // Update company info when profile loads
  useEffect(() => {
    if (profile) {
      form.setValue('companyName', profile.company_name || '');
      form.setValue('companyPhone', profile.phone || '');
    }
  }, [profile, form]);

  const handleEntitySelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity(value);
    setSelectedInvoice(null); // Reset selected invoice when customer changes
    
    if (value.type === 'customer') {
      form.setValue('customerName', value.data.full_name);
      form.setValue('customerPhone', value.data.phone || '');
      form.setValue('customerAddress', value.data.address || '');
      form.setValue('customerHp', value.data.id_number || '');
    } else {
      form.setValue('customerName', value.data.name);
      form.setValue('customerPhone', value.data.phone || '');
      form.setValue('customerAddress', '');
      form.setValue('customerHp', '');
    }
  };

  const calculateCreditAmount = () => {
    if (!selectedInvoice) return { creditAmount: 0, vatAmount: 0, totalCreditAmount: 0 };
    
    const totalAmount = selectedInvoice.totalAmount;
    const vatRate = 0.18;
    const creditAmount = totalAmount / (1 + vatRate);
    const vatAmount = totalAmount - creditAmount;
    
    return {
      creditAmount,
      vatAmount,
      totalCreditAmount: totalAmount
    };
  };

  const financialSummary = calculateCreditAmount();

  const onSubmit = async (data: TaxInvoiceCreditFormData) => {
    if (!selectedInvoice) {
      toast({
        title: "שגיאה",
        description: "יש לבחור חשבונית לזיכוי",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const creditData: Omit<TaxInvoiceCreditData, 'creditInvoiceNumber'> = {
        date: data.date.toISOString(),
        title: data.title,
        company: {
          name: data.companyName,
          address: data.companyAddress,
          hp: data.companyHp,
          phone: data.companyPhone,
          authorizedDealer: data.companyAuthorizedDealer
        },
        customer: {
          name: data.customerName,
          address: data.customerAddress,
          hp: data.customerHp,
          phone: data.customerPhone
        },
        creditForType: data.creditForType,
        originalInvoice: {
          id: selectedInvoice.id,
          invoiceNumber: selectedInvoice.invoiceNumber,
          date: selectedInvoice.date,
          totalAmount: selectedInvoice.totalAmount
        },
        allocationMode: data.allocationMode,
        allocationNumber: data.allocationNumber,
        ...financialSummary,
        notes: data.notes,
        customerId: selectedEntity?.type === 'customer' ? selectedEntity.id : undefined,
        leadId: selectedEntity?.type === 'lead' ? selectedEntity.id : undefined
      };

      const result = await createTaxInvoiceCredit(creditData);
      setSavedCreditData(result);
      setIsSaved(true);
      
      // Generate PDF as Blob and upload to cloud
      const pdfBlob = await generateTaxInvoiceCreditPDF(result, true) as Blob;
      const url = await uploadDocument({
        pdfBlob,
        documentType: 'tax_invoice',
        documentNumber: result.creditInvoiceNumber,
        customerName: result.customer.name,
        entityType: selectedEntity?.type,
        entityId: selectedEntity?.id
      });
      
      setDocumentUrl(url);
      
      toast({
        title: "חשבונית מס זיכוי נשמרה בהצלחה",
        description: `מספר חשבונית: ${result.creditInvoiceNumber}`,
      });
    } catch (error) {
      console.error('Error creating tax invoice credit:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!selectedInvoice) {
        toast({
          title: "שגיאה",
          description: "יש לבחור חשבונית לזיכוי",
          variant: "destructive",
        });
        return;
      }

      const dataToUse = savedCreditData || {
        creditInvoiceNumber: 'DRAFT',
        date: form.getValues('date').toISOString(),
        title: form.getValues('title'),
        company: {
          name: form.getValues('companyName'),
          address: form.getValues('companyAddress'),
          hp: form.getValues('companyHp'),
          phone: form.getValues('companyPhone'),
          authorizedDealer: form.getValues('companyAuthorizedDealer')
        },
        customer: {
          name: form.getValues('customerName'),
          address: form.getValues('customerAddress'),
          hp: form.getValues('customerHp'),
          phone: form.getValues('customerPhone')
        },
        creditForType: form.getValues('creditForType'),
        originalInvoice: {
          id: selectedInvoice.id,
          invoiceNumber: selectedInvoice.invoiceNumber,
          date: selectedInvoice.date,
          totalAmount: selectedInvoice.totalAmount
        },
        allocationMode: form.getValues('allocationMode'),
        allocationNumber: form.getValues('allocationNumber'),
        ...financialSummary,
        notes: form.getValues('notes')
      } as TaxInvoiceCreditData;

      await generateTaxInvoiceCreditPDF(dataToUse);
      
      toast({
        title: "PDF הורד בהצלחה",
        description: "חשבונית מס זיכוי הורדה בהצלחה",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "שגיאה בהורדת PDF",
        description: "אירעה שגיאה בהורדת החשבונית",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppSend = () => {
    const dataToUse = savedCreditData || {
      creditInvoiceNumber: form.getValues('title'),
      company: {
        name: form.getValues('companyName'),
        phone: form.getValues('companyPhone')
      },
      customer: {
        name: form.getValues('customerName'),
        phone: form.getValues('customerPhone')
      },
      totalCreditAmount: financialSummary.totalCreditAmount
    };

    const phoneNumber = dataToUse.customer.phone;
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    
    if (!formattedPhone) {
      toast({
        title: "שגיאה",
        description: "מספר טלפון לא תקין",
        variant: "destructive",
      });
      return;
    }

    let message = `שלום ${dataToUse.customer.name},\n\nחשבונית מס זיכוי מספר: ${dataToUse.creditInvoiceNumber}\nסכום זיכוי: ${dataToUse.totalCreditAmount.toFixed(2)} ₪`;
    
    if (documentUrl) {
      message += `\n\n📄 לצפייה והורדת הקובץ:\n${documentUrl}`;
    }
    
    message += `\n\nתודה!\n${dataToUse.company.name}`;
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileContainer withPadding={false} withBottomNav={true}>
        <MobileDocumentHeader 
          title="חשבונית מס זיכוי" 
          icon={<FileText className="h-5 w-5" />}
        />
        
        {isSaved && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">נשמר בענן</span>
          </div>
        )}
        
        <div className="p-4 space-y-4 pb-44">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* General Info */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-red-50 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg">מידע כללי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">תאריך</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full h-11 text-right font-normal justify-start rounded-xl text-sm"
                                >
                                  {field.value ? format(field.value, "dd/MM/yy", { locale: he }) : "בחר"}
                                  <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">כותרת</FormLabel>
                          <FormControl>
                            <Input {...field} className="text-right rounded-xl h-11 text-sm" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm">לקוח</Label>
                    <CustomerAndLeadSearchSelect
                      onValueChange={handleEntitySelect}
                      placeholder="חפש לקוח..."
                    />
                  </div>

                  {/* Credit For Type */}
                  <FormField
                    control={form.control}
                    name="creditForType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">זיכוי עבור</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4 justify-end"
                          >
                            <div className="flex items-center gap-2">
                              <Label htmlFor="m_tax_invoice" className="cursor-pointer text-sm">חשבונית מס</Label>
                              <RadioGroupItem value="tax_invoice" id="m_tax_invoice" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="m_tax_invoice_receipt" className="cursor-pointer text-sm">חש' מס קבלה</Label>
                              <RadioGroupItem value="tax_invoice_receipt" id="m_tax_invoice_receipt" />
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Select Invoice */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-amber-50 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg">בחר חשבונית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 h-10 rounded-xl text-sm">
                          <CalendarIcon className="ml-1 h-4 w-4" />
                          {fromDate ? format(fromDate, "dd/MM/yy") : "מ-"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={fromDate || undefined} onSelect={(d) => setFromDate(d || null)} />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 h-10 rounded-xl text-sm">
                          <CalendarIcon className="ml-1 h-4 w-4" />
                          {toDate ? format(toDate, "dd/MM/yy") : "עד-"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={toDate || undefined} onSelect={(d) => setToDate(d || null)} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {!selectedEntity ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">בחר לקוח תחילה</div>
                  ) : isLoadingInvoices ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">טוען...</div>
                  ) : originalInvoices.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">לא נמצאו חשבוניות</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {originalInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          onClick={() => setSelectedInvoice(invoice)}
                          className={cn(
                            "p-3 border rounded-xl cursor-pointer transition-all",
                            selectedInvoice?.id === invoice.id 
                              ? "border-red-500 bg-red-50 ring-2 ring-red-200" 
                              : "border-border hover:border-red-300"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              {selectedInvoice?.id === invoice.id && <Check className="h-4 w-4 text-red-600" />}
                              <span className="font-medium text-sm">₪{invoice.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">{invoice.invoiceNumber}</div>
                              <div className="text-xs text-muted-foreground">{format(new Date(invoice.date), "dd/MM/yy")}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-slate-50 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg">הערות</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea {...field} placeholder="הערות..." className="text-right rounded-xl min-h-[80px]" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
                <div className="bg-gradient-to-br from-red-600 via-red-500 to-red-400 p-5 text-white">
                  <h3 className="text-lg font-bold text-center mb-3">סה"כ זיכוי</h3>
                  <div className="text-3xl font-bold text-center">
                    ₪ {financialSummary.totalCreditAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                  </div>
                  {selectedInvoice && (
                    <div className="mt-3 pt-3 border-t border-white/20 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>₪{financialSummary.creditAmount.toFixed(2)}</span>
                        <span>לפני מע"מ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>₪{financialSummary.vatAmount.toFixed(2)}</span>
                        <span>מע"מ</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Fixed Action Buttons */}
              <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t shadow-lg z-50">
                <div className="space-y-2 max-w-md mx-auto">
                  <Button
                    type="submit"
                    disabled={isGenerating || isCreating || isUploading || !selectedInvoice}
                    className="w-full h-12 rounded-xl text-base font-bold bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating || isCreating ? "טוען..." : "הפק מסמך"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={handleDownloadPDF} disabled={!selectedInvoice} className="h-10 rounded-xl">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                    <Button type="button" onClick={handleWhatsAppSend} disabled={!watchedFields.customerPhone} className="h-10 rounded-xl bg-green-600">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      וואטסאפ
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </MobileContainer>
    );
  }

  // Desktop Layout
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-8 text-right">
        <h1 className="text-4xl font-bold bg-gradient-to-l from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
          חשבונית מס זיכוי
        </h1>
        <p className="text-muted-foreground text-lg">
          צור חשבונית מס זיכוי על בסיס חשבונית קיימת
        </p>
      </div>
      
      {/* Save Status Indicator */}
      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">חשבונית הזיכוי נשמרה בענן</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Information */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-red-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">מידע כללי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-right">תאריך</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-right font-normal justify-start rounded-xl",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: he })
                                  ) : (
                                    <span>בחר תאריך</span>
                                  )}
                                  <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">כותרת</FormLabel>
                          <FormControl>
                            <Input {...field} className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Customer Selection */}
                  <div className="space-y-2">
                    <Label className="text-right block">לקוח</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <CustomerAndLeadSearchSelect
                          onValueChange={handleEntitySelect}
                          placeholder="התחל להקליד את שם הלקוח המבוקש..."
                        />
                      </div>
                      <Dialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="default" className="rounded-xl bg-primary">
                            <Plus className="h-4 w-4 ml-1" />
                            לקוח חדש
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-right">הוספת לקוח חדש</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 text-center text-muted-foreground">
                            יש ללכת לעמוד לקוחות להוספת לקוח חדש
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Credit For Type */}
                  <FormField
                    control={form.control}
                    name="creditForType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right block">זיכוי עבור</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-6 justify-end"
                          >
                            <div className="flex items-center gap-2">
                              <Label htmlFor="tax_invoice" className="cursor-pointer">חשבונית מס</Label>
                              <RadioGroupItem value="tax_invoice" id="tax_invoice" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="tax_invoice_receipt" className="cursor-pointer">חשבונית מס קבלה</Label>
                              <RadioGroupItem value="tax_invoice_receipt" id="tax_invoice_receipt" />
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Select Original Invoice */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-amber-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">בחר חשבונית מס</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Date Range */}
                  <div className="flex gap-4 items-end justify-end flex-wrap">
                    <div className="space-y-2">
                      <Label className="text-right block">מתאריך</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[160px] justify-start text-right rounded-xl"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "dd/MM/yyyy", { locale: he }) : "בחר"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={fromDate || undefined}
                            onSelect={(date) => setFromDate(date || null)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-right block">ועד תאריך</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[160px] justify-start text-right rounded-xl"
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {toDate ? format(toDate, "dd/MM/yyyy", { locale: he }) : "בחר"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={toDate || undefined}
                            onSelect={(date) => setToDate(date || null)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Invoice List or Message */}
                  {!selectedEntity ? (
                    <div className="text-center py-8 text-muted-foreground">
                      בחר לקוח תחילה
                    </div>
                  ) : isLoadingInvoices ? (
                    <div className="text-center py-8 text-muted-foreground">
                      טוען חשבוניות...
                    </div>
                  ) : originalInvoices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      לא נמצאו חשבוניות בטווח התאריכים הנבחר
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {originalInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          onClick={() => setSelectedInvoice(invoice)}
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer transition-all hover:border-primary",
                            selectedInvoice?.id === invoice.id 
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                              : "border-border"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {selectedInvoice?.id === invoice.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                              <span className="font-medium">₪{invoice.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(invoice.date), "dd/MM/yyyy", { locale: he })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Allocation Number & Notes */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-slate-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">מספר הקצאה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="allocationMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-6 justify-end"
                          >
                            <div className="flex items-center gap-2">
                              <Label htmlFor="manual" className="cursor-pointer">הוסף מספר הקצאה ידנית</Label>
                              <RadioGroupItem value="manual" id="manual" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="request" className="cursor-pointer">בקש מספר הקצאה</Label>
                              <RadioGroupItem value="request" id="request" />
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('allocationMode') === 'manual' && (
                    <FormField
                      control={form.control}
                      name="allocationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="הזן מספר הקצאה" 
                              className="text-right rounded-xl" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="text-sm text-muted-foreground text-right space-y-1">
                    <p>מספר ההקצאה שסופק ע"י רשות המיסים.</p>
                    <p>אם אין צורך במספר הקצאה עבור מסמך זה, השאר שדה זה ריק.</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-right">הערות</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="הערות נוספות..." 
                            className="text-right rounded-xl min-h-[100px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary Card */}
            <div className="space-y-6">
              {/* Credit Summary Card */}
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden sticky top-6">
                <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="h-8 w-8 opacity-80" />
                    <h3 className="text-xl font-bold">סה"כ זיכוי</h3>
                  </div>
                  
                  <div className="text-4xl font-bold text-center py-6">
                    ₪ {financialSummary.totalCreditAmount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {selectedInvoice && (
                    <div className="mt-4 pt-4 border-t border-white/20 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>₪{financialSummary.creditAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                        <span>סכום לפני מע"מ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>₪{financialSummary.vatAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                        <span>מע"מ (18%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isGenerating || isCreating || isUploading || !selectedInvoice}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700"
                >
                  {isGenerating || isCreating || isUploading ? (
                    <>טוען...</>
                  ) : (
                    <>
                      <FileText className="ml-2 h-5 w-5" />
                      הפק מסמך
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPDF}
                    disabled={!selectedInvoice}
                    className="h-12 rounded-xl"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    הורד PDF
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWhatsAppSend}
                    disabled={!watchedFields.customerPhone}
                    className="h-12 rounded-xl"
                  >
                    <MessageCircle className="ml-2 h-4 w-4" />
                    וואטסאפ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
