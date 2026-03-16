import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Download, MessageCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useLeads } from '@/hooks/use-leads';
import { CustomerAndLeadSearchSelect } from '@/components/customers/CustomerAndLeadSearchSelect';
import { useCars } from '@/hooks/use-cars';
import { useCustomers } from '@/hooks/customers';
import { useProfile } from '@/hooks/use-profile';

import { useTaxInvoiceReceipt } from '@/hooks/tax-invoice-receipt/use-tax-invoice-receipt';
import type { TaxInvoiceReceiptData, TaxInvoiceReceiptItem, PaymentMethod } from '@/types/tax-invoice-receipt';
import { formatPhoneForWhatsApp } from '@/utils/phone-utils';
import { useUploadProductionDocument } from '@/hooks/use-upload-production-document';
import { generateTaxInvoiceReceiptPDF } from '@/utils/pdf/tax-invoice-receipt-pdf';
import { useAddCustomerVehiclePurchase } from '@/hooks/customers/use-customer-vehicles';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { MobileDocumentHeader } from '@/components/mobile/MobileDocumentHeader';
import { Label } from '@/components/ui/label';

const receiptItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'תיאור הפריט נדרש'),
  quantity: z.number().min(0.01, 'כמות חייבת להיות גדולה מ-0'),
  unitPrice: z.number().min(0, 'מחיר יחידה חייב להיות חיובי'),
  vatRate: z.number().min(0).max(100, 'אחוז מע"מ חייב להיות בין 0 ל-100'),
  discount: z.number().min(0, 'הנחה חייבת להיות חיובית'),
  total: z.number(),
  includeVat: z.boolean(),
});

const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'other']),
  amount: z.number().min(0, 'סכום חייב להיות חיובי'),
  date: z.date(),
  reference: z.string().optional(),
  // Check fields
  checkAccountNumber: z.string().optional(),
  checkBranchNumber: z.string().optional(),
  checkBankNumber: z.string().optional(),
  checkNumber: z.string().optional(),
  // Credit card fields
  lastFourDigits: z.string().optional(),
  expiryDate: z.string().optional(),
  cardType: z.string().optional(),
  idNumber: z.string().optional(),
  installments: z.number().optional(),
  // Bank transfer fields
  bankAccountNumber: z.string().optional(),
  bankBranchNumber: z.string().optional(),
  bankNumber: z.string().optional(),
  // Other
  paymentTypeName: z.string().optional(),
});

const taxInvoiceReceiptSchema = z.object({
  date: z.date({ required_error: 'תאריך נדרש' }),
  type: z.enum(['primary', 'secondary']),
  language: z.enum(['hebrew', 'english']),
  title: z.string().min(1, 'כותרת נדרשת'),
  currency: z.enum(['ILS', 'USD']),
  leadId: z.string().optional(),
  carId: z.string().optional(),
  
  // Company info
  companyName: z.string().min(1, 'שם החברה נדרש'),
  companyAddress: z.string().min(1, 'כתובת החברה נדרשת'),
  companyHp: z.string().min(1, 'מספר עוסק מורשה נדרש'),
  companyPhone: z.string().min(1, 'טלפון החברה נדרש'),
  companyAuthorizedDealer: z.boolean(),
  
  // Customer info
  customerType: z.enum(['new', 'existing', 'individual', 'business']),
  customerName: z.string().min(1, 'שם הלקוח נדרש'),
  customerAddress: z.string().min(1, 'כתובת הלקוח נדרשת'),
  customerHp: z.string().min(1, 'ח.פ/ת.ז הלקוח נדרש'),
  customerPhone: z.string().min(1, 'טלפון הלקוח נדרש'),
  
  // Items
  items: z.array(receiptItemSchema).min(1, 'לפחות פריט אחד נדרש'),
  
  // Payments
  payments: z.array(paymentMethodSchema),
  
  // Issue number (optional)
  issueNumber: z.string().optional(),
  
  // General discount
  generalDiscount: z.number().min(0, 'הנחה כללית חייבת להיות חיובית'),
  
  // Additional
  lastPaymentDate: z.date().optional(),
  notes: z.string().optional(),
});

type TaxInvoiceReceiptFormData = z.infer<typeof taxInvoiceReceiptSchema>;

export default function TaxInvoiceReceipt() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedReceiptData, setSavedReceiptData] = useState<TaxInvoiceReceiptData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  
  const isMobile = useIsMobile();
  const { leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { cars = [] } = useCars();
  const { profile } = useProfile();
  const { createTaxInvoiceReceipt, isCreating } = useTaxInvoiceReceipt();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();
  const addPurchase = useAddCustomerVehiclePurchase();

  const form = useForm<TaxInvoiceReceiptFormData>({
    resolver: zodResolver(taxInvoiceReceiptSchema),
    defaultValues: {
      date: new Date(),
      type: 'primary' as const,
      language: 'hebrew' as const,
      title: 'חשבונית מס קבלה',
      currency: 'ILS',
      companyName: profile?.company_name || 'חברתי',
      companyAddress: 'כתובת החברה',
      companyHp: '123456789',
      companyPhone: profile?.phone || '050-1234567',
      companyAuthorizedDealer: false,
      customerType: 'new' as const,
      customerName: '',
      customerAddress: '',
      customerHp: '',
      customerPhone: '',
      items: [{
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 18,
        discount: 0,
        total: 0,
        includeVat: true
      }],
      payments: [],
      issueNumber: '',
      generalDiscount: 0,
      notes: ''
    }
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: 'payments'
  });

  const watchedFields = form.watch();
  const selectedLead = leads.find(lead => lead.id === watchedFields.leadId);

  // Update company info when profile loads
  useEffect(() => {
    if (profile) {
      form.setValue('companyName', profile.company_name || '');
      form.setValue('companyPhone', profile.phone || '');
      form.setValue('companyAddress', profile.company_address || '');
      form.setValue('companyHp', profile.company_hp || '');
      form.setValue('companyAuthorizedDealer', profile.company_authorized_dealer || false);
    }
  }, [profile, form]);

  // Handle entity selection (customer or lead)
  const handleEntitySelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity(value);
    
    if (value.type === 'lead') {
      form.setValue('leadId', value.id);
      form.setValue('customerName', value.data.name);
      form.setValue('customerPhone', value.data.phone || '');
      if (!form.getValues('customerAddress')) {
        form.setValue('customerAddress', '');
      }
      if (!form.getValues('customerHp')) {
        form.setValue('customerHp', '');
      }
    } else {
      form.setValue('leadId', undefined);
      form.setValue('customerName', value.data.full_name);
      form.setValue('customerPhone', value.data.phone || '');
      form.setValue('customerAddress', value.data.address || '');
      form.setValue('customerHp', value.data.id_number || '');
    }
  };

   // Calculate totals for each item
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('items') && !name.includes('total')) {
        const items = value.items || [];
        items.forEach((item, index) => {
          if (item) {
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const discount = item.discount || 0;
            const includeVat = item.includeVat !== false;
            const vatRate = item.vatRate || 18;
            
            const base = quantity * unitPrice - discount;
            let total: number;
            
            if (includeVat) {
              // מע"מ דלוק - מוסיפים מע"מ על מחיר הבסיס
              total = base + (base * vatRate / 100);
            } else {
              // מע"מ כבוי - המחיר נשאר כמו שהוא
              total = base;
            }
            
            const currentTotal = form.getValues(`items.${index}.total`);
            if (Math.abs(currentTotal - total) > 0.01) {
              form.setValue(`items.${index}.total`, total, { shouldValidate: false });
            }
          }
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Calculate financial summary
  const calculateFinancialSummary = () => {
    const items = watchedFields.items || [];
    const generalDiscount = watchedFields.generalDiscount || 0;
    
    let subtotal = 0; // סה"כ נטו (לפני מע"מ)
    let totalVat = 0; // סה"כ מע"מ
    let itemsWithoutVat = 0; // tracking for display
    
    items.forEach(item => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const discount = item.discount || 0;
      const vatRate = item.vatRate || 18;
      
      // מחשבים בסיס מהשדות המקוריים, לא מ-item.total
      const base = quantity * unitPrice - discount;
      
      if (item.includeVat) {
        // מע"מ דלוק - מוסיפים מע"מ
        subtotal += base;
        totalVat += base * vatRate / 100;
      } else {
        // מע"מ כבוי - אין מע"מ
        subtotal += base;
        itemsWithoutVat += base;
      }
    });
    
    const amountAfterDiscount = subtotal - generalDiscount;
    // Scale VAT proportionally if there's a general discount
    const vatAmount = subtotal > 0 
      ? totalVat * (amountAfterDiscount / subtotal)
      : 0;
    const totalAmount = amountAfterDiscount + vatAmount;
    
    return {
      subtotal,
      itemsWithoutVat,
      generalDiscount,
      amountAfterDiscount,
      vatAmount,
      totalAmount
    };
  };

  const financialSummary = calculateFinancialSummary();

  const onSubmit = async (data: TaxInvoiceReceiptFormData) => {
    try {
      setIsGenerating(true);
      
      const receiptData: Omit<TaxInvoiceReceiptData, 'invoiceNumber'> = {
        date: data.date.toISOString(),
        type: data.type,
        language: data.language,
        currency: data.currency,
        title: data.title,
        company: {
          name: data.companyName,
          address: data.companyAddress,
          hp: data.companyHp,
          phone: data.companyPhone,
          authorizedDealer: data.companyAuthorizedDealer,
          logoUrl: profile?.company_logo_url || undefined,
          companyType: profile?.company_type || undefined,
        },
        customer: {
          type: data.customerType,
          name: data.customerName,
          address: data.customerAddress,
          hp: data.customerHp,
          phone: data.customerPhone
        },
        items: data.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discount: item.discount,
          total: item.total,
          includeVat: item.includeVat
        })),
        payments: data.payments.map(p => ({
          id: p.id,
          type: p.type,
          amount: p.amount,
          date: p.date.toISOString(),
          reference: p.reference,
          checkAccountNumber: p.checkAccountNumber,
          checkBranchNumber: p.checkBranchNumber,
          checkBankNumber: p.checkBankNumber,
          checkNumber: p.checkNumber,
          lastFourDigits: p.lastFourDigits,
          expiryDate: p.expiryDate,
          cardType: p.cardType,
          idNumber: p.idNumber,
          installments: p.installments,
          bankAccountNumber: p.bankAccountNumber,
          bankBranchNumber: p.bankBranchNumber,
          bankNumber: p.bankNumber,
          paymentTypeName: p.paymentTypeName,
        })),
        issueNumber: data.issueNumber,
        lastPaymentDate: data.lastPaymentDate?.toISOString(),
        notes: data.notes,
        leadId: data.leadId,
        carId: data.carId,
        ...financialSummary
      };

      const result = await createTaxInvoiceReceipt(receiptData);
      setSavedReceiptData(result);
      setIsSaved(true);
      
      // Determine entity type and ID for document linking
      let entityType: 'customer' | 'lead' | undefined;
      let entityId: string | undefined;
      
      if (selectedEntity?.type === 'customer') {
        entityType = 'customer';
        entityId = selectedEntity.id;
      } else if (data.leadId) {
        entityType = 'lead';
        entityId = data.leadId;
      }
      
      // Sync car sale to customer if both car and customer are selected
      if (data.carId && data.carId !== 'no-car' && selectedEntity?.type === 'customer') {
        try {
          await addPurchase.mutateAsync({
            customerId: selectedEntity.id,
            carId: data.carId,
            purchasePrice: financialSummary.totalAmount,
            purchaseDate: format(data.date, 'yyyy-MM-dd')
          });
          toast({
            title: "רכב שויך ללקוח",
            description: "הרכב נוסף לרשימת הרכבים של הלקוח",
          });
        } catch (error) {
          console.error('Error syncing car to customer:', error);
        }
      }
      
      // Generate and upload PDF to storage
      try {
        const pdfBlob = await generateTaxInvoiceReceiptPDF(result, true) as Blob;
        if (pdfBlob) {
          const publicUrl = await uploadDocument({
            pdfBlob,
            documentType: 'tax_invoice_receipt',
            documentNumber: result.invoiceNumber,
            customerName: result.customer?.name || '',
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
      
      toast({
        title: "חשבונית מס קבלה נשמרה בהצלחה",
        description: `מספר חשבונית: ${result.invoiceNumber}`,
      });
    } catch (error) {
      console.error('Error creating tax invoice receipt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const dataToUse = savedReceiptData || {
        ...form.getValues(),
        invoiceNumber: 'DRAFT',
        date: form.getValues('date').toISOString(),
        company: {
          name: form.getValues('companyName'),
          address: form.getValues('companyAddress'),
          hp: form.getValues('companyHp'),
          phone: form.getValues('companyPhone'),
          authorizedDealer: form.getValues('companyAuthorizedDealer'),
          logoUrl: profile?.company_logo_url || undefined,
          companyType: profile?.company_type || undefined,
        },
        customer: {
          type: form.getValues('customerType'),
          name: form.getValues('customerName'),
          address: form.getValues('customerAddress'),
          hp: form.getValues('customerHp'),
          phone: form.getValues('customerPhone')
        },
        payments: form.getValues('payments').map(p => ({
          ...p,
          date: p.date.toISOString()
        })),
        lastPaymentDate: form.getValues('lastPaymentDate')?.toISOString(),
        ...financialSummary
      } as TaxInvoiceReceiptData;

      await generateTaxInvoiceReceiptPDF(dataToUse);
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
    const dataToUse = savedReceiptData || {
      invoiceNumber: form.getValues('title'),
      company: {
        name: form.getValues('companyName'),
        phone: form.getValues('companyPhone')
      },
      customer: {
        name: form.getValues('customerName'),
        phone: form.getValues('customerPhone')
      },
      totalAmount: financialSummary.totalAmount,
      currency: form.getValues('currency')
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

    const currencySymbol = dataToUse.currency === 'ILS' ? '₪' : '$';
    let message = `שלום ${dataToUse.customer.name},\n\nחשבונית מס קבלה מספר: ${dataToUse.invoiceNumber}\nסכום: ${dataToUse.totalAmount.toFixed(2)} ${currencySymbol}`;
    
    if (documentUrl) {
      message += `\n\n📄 לצפייה והורדת המסמך:\n${documentUrl}`;
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
          title="חשבונית מס קבלה" 
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
                <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
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
                                <Button variant="outline" className="w-full h-11 text-right font-normal justify-start rounded-xl text-sm">
                                  {field.value ? format(field.value, "dd/MM/yy", { locale: he }) : "בחר"}
                                  <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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

                  {/* Customer Details */}
                  <div className="space-y-3">
                    <Input
                      value={watchedFields.customerName}
                      onChange={(e) => form.setValue('customerName', e.target.value)}
                      className="text-right h-11 rounded-xl"
                      placeholder="שם הלקוח"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={watchedFields.customerPhone}
                        onChange={(e) => form.setValue('customerPhone', e.target.value)}
                        className="text-right h-10 rounded-xl"
                        placeholder="טלפון"
                      />
                      <Input
                        value={watchedFields.customerHp}
                        onChange={(e) => form.setValue('customerHp', e.target.value)}
                        className="text-right h-10 rounded-xl"
                        placeholder="ח.פ/ת.ז"
                      />
                    </div>
                  </div>

                  {/* Car Selection */}
                  <FormField
                    control={form.control}
                    name="carId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">רכב (אופציונלי)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-right rounded-xl h-11">
                              <SelectValue placeholder="בחר רכב" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-car">ללא רכב</SelectItem>
                            {cars.map((car) => (
                              <SelectItem key={car.id} value={car.id}>
                                {car.make} {car.model} ({car.year})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Items */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-3">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => appendItem({
                        id: crypto.randomUUID(),
                        description: '',
                        quantity: 1,
                        unitPrice: 0,
                        vatRate: 18,
                        discount: 0,
                        total: 0,
                        includeVat: true
                      })}
                      className="h-8 rounded-xl"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      הוסף
                    </Button>
                    <CardTitle className="text-lg">פריטים</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {itemFields.map((field, index) => (
                    <Card key={field.id} className="p-3 bg-muted/30 rounded-xl border">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={itemFields.length === 1}
                            className="h-7 px-2 rounded-lg"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <span className="font-medium text-sm">פריט {index + 1}</span>
                        </div>

                        <Input
                          {...form.register(`items.${index}.description`)}
                          className="text-right h-10 rounded-xl"
                          placeholder="תיאור"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">מחיר</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                              className="text-right h-9 rounded-xl text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">כמות</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                              className="text-right h-9 rounded-xl text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">הנחה</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                              className="text-right h-9 rounded-xl text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-primary/5 rounded-xl">
                          <span className="font-bold text-primary text-sm">
                            ₪{(watchedFields.items?.[index]?.total || 0).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">כולל מע"מ</Label>
                            <Switch
                              checked={watchedFields.items?.[index]?.includeVat}
                              onCheckedChange={(checked) => form.setValue(`items.${index}.includeVat`, checked)}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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
                          <Textarea {...field} placeholder="הערות..." className="text-right rounded-xl min-h-[60px]" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
                <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-5 text-white">
                  <h3 className="text-lg font-bold text-center mb-3">סה"כ לתשלום</h3>
                  <div className="text-3xl font-bold text-center">
                    ₪ {financialSummary.totalAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>סכום חלקי</span>
                      <span>₪{financialSummary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>מע"מ</span>
                      <span>₪{financialSummary.vatAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Fixed Action Buttons */}
              <div className="fixed bottom-36 left-0 right-0 p-3 bg-background border-t shadow-lg z-50">
                <div className="space-y-1.5 max-w-md mx-auto">
                  <Button
                    type="submit"
                    disabled={isGenerating || isCreating || isUploading}
                    className="w-full h-11 rounded-xl text-base font-bold bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating || isCreating ? "טוען..." : "הפק חשבונית"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={handleDownloadPDF} className="h-9 rounded-xl">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                    <Button type="button" onClick={handleWhatsAppSend} disabled={!documentUrl} title={!documentUrl ? 'יש לשמור את המסמך קודם' : 'שלח בוואטסאפ'} className="h-9 rounded-xl bg-green-600">
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
        <h1 className="text-4xl font-bold bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent mb-2">
          חשבונית מס קבלה
        </h1>
        <p className="text-muted-foreground text-lg">
          צור חשבונית מס קבלה עם פרטי לקוח ותשלומים
        </p>
      </div>
      
      {/* Save Status Indicator */}
      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">החשבונית נשמרה בענן</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Information */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                  <CardTitle className="text-right text-xl">מידע כללי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                  <CalendarIcon className="ml-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: he })
                                  ) : (
                                    <span>בחר תאריך</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={he}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">מטבע</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="בחר מטבע" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent align="end" className="z-50 bg-popover text-right">
                              <SelectItem value="ILS">שקלים (₪)</SelectItem>
                              <SelectItem value="USD">דולר ($)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">שפה</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="בחר שפה" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent align="end" className="z-50 bg-popover text-right">
                              <SelectItem value="hebrew">עברית</SelectItem>
                              <SelectItem value="english">אנגלית</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">כותרת</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="חשבונית מס קבלה" className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">קשור ללקוח (אופציונלי)</FormLabel>
                          <FormControl>
                            <CustomerAndLeadSearchSelect
                              value={selectedEntity}
                              onValueChange={handleEntitySelect}
                              placeholder="בחר לקוח או ליד מהרשימה"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">סוג לקוח</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="בחר סוג לקוח" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent align="end" className="z-50 bg-popover text-right">
                              <SelectItem value="new">לקוח חדש</SelectItem>
                              <SelectItem value="existing">לקוח קיים</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                  <CardTitle className="text-right text-xl">פרטי לקוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">שם הלקוח</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם מלא" className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">טלפון</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="050-1234567" className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">כתובת</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="רחוב עיר" className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerHp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">ח.פ / ת.ז</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123456789" className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                  <CardTitle className="text-right text-xl">הוספת פריטים</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                {itemFields.map((field, index) => (
                  <div key={field.id} className="border-2 border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/40 transition-colors bg-gradient-to-br from-background to-primary/5">
                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={itemFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">פריט {index + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-right">תיאור</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="תיאור הפריט" className="text-right rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right">מחיר</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="text-right rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.includeVat`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col justify-end">
                            <FormLabel className="text-right">כולל מע"מ (18%)</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                dir="ltr"
                                className="mx-auto"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right">כמות</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="text-right rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right">הנחה</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="text-right rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.total`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right">סה"כ</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value?.toFixed(2) || '0.00'}
                                disabled
                                className="text-right bg-muted rounded-xl"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendItem({
                      id: crypto.randomUUID(),
                      description: '',
                      quantity: 1,
                      unitPrice: 0,
                      vatRate: 18,
                      discount: 0,
                      total: 0,
                      includeVat: true
                    })
                  }
                  className="w-full rounded-xl"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף פריט
                </Button>
              </div>
            </CardContent>
          </Card>

              {/* Payments */}
              <Card className="border-2 shadow-lg rounded-2xl">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
              <CardTitle className="text-right text-xl">אמצעי תשלום</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {paymentFields.map((field, index) => (
                  <div key={field.id} className="border-2 border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/40 transition-colors bg-gradient-to-br from-background to-primary/5">
                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePayment(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">תשלום {index + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`payments.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right">סוג תשלום</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="בחר סוג תשלום" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent align="end">
                                <SelectItem value="cash">מזומן</SelectItem>
                                <SelectItem value="check">המחאה</SelectItem>
                                <SelectItem value="credit_card">כרטיס אשראי</SelectItem>
                                <SelectItem value="bank_transfer">העברה בנקאית</SelectItem>
                                <SelectItem value="other">אחר</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`payments.${index}.date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-right">תאריך</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-right font-normal justify-start rounded-xl h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: he })
                                    ) : (
                                      <span>בחר תאריך</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  locale={he}
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Check-specific fields */}
                    {watchedFields.payments?.[index]?.type === 'check' && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר חשבון</Label>
                          <Input
                            {...form.register(`payments.${index}.checkAccountNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר חשבון"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר סניף</Label>
                          <Input
                            {...form.register(`payments.${index}.checkBranchNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר סניף"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר בנק</Label>
                          <Input
                            {...form.register(`payments.${index}.checkBankNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר בנק"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר המחאה</Label>
                          <Input
                            {...form.register(`payments.${index}.checkNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר המחאה"
                          />
                        </div>
                      </div>
                    )}

                    {/* Credit card fields */}
                    {watchedFields.payments?.[index]?.type === 'credit_card' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">4 ספרות אחרונות</Label>
                          <Input
                            {...form.register(`payments.${index}.lastFourDigits`)}
                            maxLength={4}
                            inputMode="numeric"
                            className="text-right rounded-xl h-10"
                            placeholder="1234"
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              form.setValue(`payments.${index}.lastFourDigits`, val);
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">תוקף (MM/YY)</Label>
                          <Input
                            {...form.register(`payments.${index}.expiryDate`)}
                            className="text-right rounded-xl h-10"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">סוג כרטיס</Label>
                          <Select
                            value={watchedFields.payments?.[index]?.cardType || ''}
                            onValueChange={(val) => form.setValue(`payments.${index}.cardType`, val)}
                          >
                            <SelectTrigger className="rounded-xl h-10">
                              <SelectValue placeholder="בחר סוג" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mastercard">מאסטרקארד</SelectItem>
                              <SelectItem value="Visa">ויזה</SelectItem>
                              <SelectItem value="Diners">דיינרס קלאב</SelectItem>
                              <SelectItem value="American Express">אמריקן אקספרס</SelectItem>
                              <SelectItem value="Maestro">מאסטרו</SelectItem>
                              <SelectItem value="Isracard">ישראכרט</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">ת.ז/ח.פ</Label>
                          <Input
                            {...form.register(`payments.${index}.idNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="ת.ז/ח.פ"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">תשלומים</Label>
                          <Select
                            value={String(watchedFields.payments?.[index]?.installments || 1)}
                            onValueChange={(val) => form.setValue(`payments.${index}.installments`, parseInt(val))}
                          >
                            <SelectTrigger className="rounded-xl h-10">
                              <SelectValue placeholder="תשלומים" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {Array.from({ length: 120 }, (_, i) => i + 1).map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Bank transfer fields */}
                    {watchedFields.payments?.[index]?.type === 'bank_transfer' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר חשבון</Label>
                          <Input
                            {...form.register(`payments.${index}.bankAccountNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר חשבון"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר סניף</Label>
                          <Input
                            {...form.register(`payments.${index}.bankBranchNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר סניף"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">מספר בנק</Label>
                          <Input
                            {...form.register(`payments.${index}.bankNumber`)}
                            className="text-right rounded-xl h-10"
                            placeholder="מספר בנק"
                          />
                        </div>
                      </div>
                    )}

                    {/* Other payment type */}
                    {watchedFields.payments?.[index]?.type === 'other' && (
                      <div className="p-4 bg-muted/30 rounded-xl border border-dashed">
                        <div className="space-y-1.5">
                          <Label className="text-sm text-right block">סוג תשלום</Label>
                          <Input
                            {...form.register(`payments.${index}.paymentTypeName`)}
                            className="text-right rounded-xl h-10"
                            placeholder="פייפאל/פייבוקס/ביט"
                          />
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name={`payments.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">סה"כ</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="text-right rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendPayment({
                      id: crypto.randomUUID(),
                      type: 'cash' as const,
                      amount: 0,
                      date: new Date(),
                      reference: ''
                    })
                  }
                  className="w-full rounded-xl"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף תשלום
                </Button>
              </div>
            </CardContent>
          </Card>

              {/* Additional Details */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                  <CardTitle className="text-right text-xl">פרטים נוספים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">מס' הקצאה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="מספר הקצאה" className="text-right rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generalDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">הנחה כללית</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="text-right rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastPaymentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-right">תאריך אחרון לתשלום</FormLabel>
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
                                  <CalendarIcon className="ml-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: he })
                                  ) : (
                                    <span>בחר תאריך</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={he}
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            className="text-right min-h-[100px] rounded-xl"
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
            <div className="sticky top-6 space-y-6">
              {/* Financial Summary Card */}
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Download className="h-8 w-8 opacity-80" />
                    <h3 className="text-xl font-bold">סה"כ לתשלום</h3>
                  </div>
                  
                  <div className="text-4xl font-bold text-center py-6">
                    {watchedFields.currency === 'ILS' ? '₪' : '$'} {financialSummary.totalAmount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/20 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>סה"כ לפני מע"מ (נטו)</span>
                      <span>{watchedFields.currency === 'ILS' ? '₪' : '$'}{financialSummary.subtotal.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {financialSummary.generalDiscount > 0 && (
                      <div className="flex justify-between text-red-200">
                        <span>הנחה כללית</span>
                        <span>-{watchedFields.currency === 'ILS' ? '₪' : '$'}{financialSummary.generalDiscount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>מע"מ (18%)</span>
                      <span>{watchedFields.currency === 'ILS' ? '₪' : '$'}{financialSummary.vatAmount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isGenerating || isCreating}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700"
                >
                  {isGenerating || isCreating ? (
                    <>טוען...</>
                  ) : (
                    <>
                      <Download className="ml-2 h-5 w-5" />
                      הפק מסמך
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="h-12 rounded-xl"
                  >
                    <Download className="ml-2 h-4 w-4" />
                    הורד PDF
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleWhatsAppSend}
                    disabled={!documentUrl}
                    title={!documentUrl ? 'יש לשמור את המסמך קודם' : 'שלח בוואטסאפ'}
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
