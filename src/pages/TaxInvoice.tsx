import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CarSearchSelect } from '@/components/cars/CarSearchSelect';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Download, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useLeads } from '@/hooks/use-leads';
import { CustomerAndLeadSearchSelect } from '@/components/customers/CustomerAndLeadSearchSelect';
import { useCars } from '@/hooks/use-cars';
import { useCustomers } from '@/hooks/customers';
import { useProfile } from '@/hooks/use-profile';
import { TaxInvoicePreview } from '@/components/tax-invoice/TaxInvoicePreview';
import { generateTaxInvoicePDF } from '@/utils/tax-invoice-pdf-generator';
import { useTaxInvoice } from '@/hooks/tax-invoice/use-tax-invoice';
import type { TaxInvoiceData, InvoiceItem } from '@/types/tax-invoice';
import { useUploadProductionDocument } from '@/hooks/use-upload-production-document';

const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'תיאור הפריט נדרש'),
  quantity: z.number().min(0.01, 'כמות חייבת להיות גדולה מ-0'),
  unitPrice: z.number().min(0, 'מחיר יחידה חייב להיות חיובי'),
  vatRate: z.number().min(0).max(100, 'אחוז מע"מ חייב להיות בין 0 ל-100'),
  total: z.number(),
  includeVat: z.boolean(),
});

const taxInvoiceSchema = z.object({
  date: z.date({ required_error: 'תאריך נדרש' }),
  title: z.string().min(1, 'כותרת נדרשת'),
  currency: z.enum(['ILS', 'USD']),
  leadId: z.string().optional(),
  carId: z.string().optional(),
  
  // Company info (seller - your business)
  companyName: z.string().min(1, 'שם החברה נדרש'),
  companyAddress: z.string().min(1, 'כתובת החברה נדרשת'),
  companyHp: z.string().min(1, 'מספר עוסק מורשה נדרש'),
  companyPhone: z.string().min(1, 'טלפון החברה נדרש'),
  companyAuthorizedDealer: z.boolean(),
  
  // Customer type selection
  customerType: z.enum(['individual', 'business']),
  
  // Customer info
  customerName: z.string().min(1, 'שם הלקוח נדרש'),
  customerAddress: z.string().min(1, 'כתובת הלקוח נדרשת'),
  customerHp: z.string().min(1, 'ח.פ/ת.ז הלקוח נדרש'),
  customerPhone: z.string().min(1, 'טלפון הלקוח נדרש'),
  
  // Business customer additional fields (conditional)
  customerCompanyName: z.string().optional(),
  customerContactPerson: z.string().optional(),
  
  // Items
  items: z.array(invoiceItemSchema).min(1, 'לפחות פריט אחד נדרש'),
  
  // Allocation number
  allocationType: z.enum(['manual', 'request']),
  allocationNumber: z.string().optional(),
  allocationCustomerType: z.enum(['individual', 'business']).optional(),
  
  // Additional
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type TaxInvoiceFormData = z.infer<typeof taxInvoiceSchema>;

export default function TaxInvoice() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  const { leads = [] } = useLeads();
  const { data: customers = [] } = useCustomers();
  const { cars = [] } = useCars();
  const { profile } = useProfile();
  const { createTaxInvoice } = useTaxInvoice();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();

  const form = useForm<TaxInvoiceFormData>({
    resolver: zodResolver(taxInvoiceSchema),
    defaultValues: {
      date: new Date(),
      title: 'חשבונית מס',
      currency: 'ILS',
      companyName: profile?.company_name || 'חברתי',
      companyAddress: 'כתובת החברה',
      companyHp: '123456789',
      companyPhone: profile?.phone || '050-1234567',
      companyAuthorizedDealer: false,
      customerType: 'individual' as const,
      customerName: '',
      customerAddress: '',
      customerHp: '',
      customerPhone: '',
      customerCompanyName: '',
      customerContactPerson: '',
      items: [{
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 17,
        total: 0,
        includeVat: true
      }] as InvoiceItem[],
      allocationType: 'manual' as const,
      allocationNumber: '',
      allocationCustomerType: 'individual' as const,
      notes: '',
      paymentTerms: 'תשלום מיידי'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  const watchedFields = form.watch();
  const selectedLead = leads.find(lead => lead.id === watchedFields.leadId);
  const selectedCar = cars.find(car => car.id === watchedFields.carId);

  // Handle entity selection (customer or lead)
  const handleEntitySelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity(value);
    
    if (value.type === 'lead') {
      form.setValue('leadId', value.id);
      form.setValue('customerName', value.data.name);
      form.setValue('customerPhone', value.data.phone || '');
      form.setValue('customerType', 'individual');
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
      form.setValue('customerType', value.data.customer_type || 'individual');
    }
  };

  // Calculate totals for each item
  useEffect(() => {
    const items = watchedFields.items as InvoiceItem[];
    items.forEach((item, index) => {
      const subtotal = item.quantity * item.unitPrice;
      const vatAmount = item.includeVat ? subtotal * (item.vatRate / 100) : 0;
      const total = subtotal + vatAmount;
      
      if (item.total !== total) {
        form.setValue(`items.${index}.total`, total);
      }
    });
  }, [watchedFields.items, form]);

  const addItem = () => {
    append({
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 17,
      total: 0,
      includeVat: true
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Calculate financial summary
  const items = watchedFields.items as InvoiceItem[];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vatAmount = items.reduce((sum, item) => sum + (item.includeVat ? item.quantity * item.unitPrice * item.vatRate / 100 : 0), 0);
  const totalAmount = subtotal + vatAmount;

  // Prepare preview data
  const previewData: TaxInvoiceData = {
    invoiceNumber: 'PREVIEW-001', // Will be generated on save
    date: format(watchedFields.date, 'yyyy-MM-dd'),
    title: watchedFields.title,
    currency: watchedFields.currency,
    company: {
      name: watchedFields.companyName,
      address: watchedFields.companyAddress,
      hp: watchedFields.companyHp,
      phone: watchedFields.companyPhone,
      authorizedDealer: watchedFields.companyAuthorizedDealer
    },
    customer: {
      name: watchedFields.customerType === 'business' && watchedFields.customerCompanyName 
        ? `${watchedFields.customerCompanyName}${watchedFields.customerContactPerson ? ' (איש קשר: ' + watchedFields.customerContactPerson + ')' : ''}`
        : watchedFields.customerName,
      address: watchedFields.customerAddress,
      hp: watchedFields.customerHp,
      phone: watchedFields.customerPhone
    },
    items: items,
    subtotal,
    vatAmount,
    totalAmount,
    notes: watchedFields.notes,
    paymentTerms: watchedFields.paymentTerms,
    leadId: watchedFields.leadId && watchedFields.leadId !== 'no-lead' ? watchedFields.leadId : undefined,
    carId: watchedFields.carId && watchedFields.carId !== 'no-car' ? watchedFields.carId : undefined
  };

  const onSubmit = async (data: TaxInvoiceFormData) => {
    try {
      setIsGenerating(true);

      const invoiceData: Omit<TaxInvoiceData, 'invoiceNumber'> = {
        date: format(data.date, 'yyyy-MM-dd'),
        title: data.title,
        currency: data.currency,
        company: {
          name: data.companyName,
          address: data.companyAddress,
          hp: data.companyHp,
          phone: data.companyPhone,
          authorizedDealer: data.companyAuthorizedDealer
        },
        customer: {
          name: data.customerType === 'business' && data.customerCompanyName 
            ? `${data.customerCompanyName}${data.customerContactPerson ? ' (איש קשר: ' + data.customerContactPerson + ')' : ''}`
            : data.customerName,
          address: data.customerAddress,
          hp: data.customerHp,
          phone: data.customerPhone
        },
        items: data.items.map((item, index) => ({
          id: item.id || crypto.randomUUID(),
          description: item.description || '',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          vatRate: Number(item.vatRate) || 17,
          total: Number(item.total) || 0,
          includeVat: Boolean(item.includeVat)
        })) as InvoiceItem[],
        subtotal,
        vatAmount,
        totalAmount,
        notes: data.notes,
        paymentTerms: data.paymentTerms,
          leadId: data.leadId === 'no-lead' ? undefined : data.leadId,
          carId: data.carId === 'no-car' ? undefined : data.carId
      };

      const savedInvoice = await createTaxInvoice(invoiceData);
      setIsSaved(true);
      
      // Generate PDF as Blob and upload to cloud
      const pdfBlob = await generateTaxInvoicePDF(savedInvoice, true) as Blob;
      const url = await uploadDocument({
        pdfBlob,
        documentType: 'tax_invoice',
        documentNumber: savedInvoice.invoiceNumber,
        customerName: savedInvoice.customer.name,
        entityType: data.leadId && data.leadId !== 'no-lead' ? 'lead' : undefined,
        entityId: data.leadId && data.leadId !== 'no-lead' ? data.leadId : undefined
      });
      
      setDocumentUrl(url);
      
      // Also download for user
      await generateTaxInvoicePDF(savedInvoice);
      
      toast({
        title: "חשבונית נוצרה בהצלחה",
        description: `חשבונית מס ${savedInvoice.invoiceNumber} נוצרה והורדה למחשב`,
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error creating tax invoice:', error);
      toast({
        title: "שגיאה ביצירת החשבונית",
        description: "אירעה שגיאה ביצירת החשבונית. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppSend = () => {
    const currencySymbol = watchedFields.currency === 'ILS' ? '₪' : '$';
    let message = `שלום ${watchedFields.customerName},\n\nחשבונית מס: ${watchedFields.title}\nסכום: ${totalAmount.toFixed(2)} ${currencySymbol}`;
    
    if (documentUrl) {
      message += `\n\n📄 לצפייה והורדת הקובץ:\n${documentUrl}`;
    }
    
    message += '\n\nתודה!';
    
    const phone = watchedFields.customerPhone?.replace(/[^\d]/g, '');
    if (phone) {
      const whatsappUrl = `https://wa.me/972${phone.startsWith('0') ? phone.slice(1) : phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast({
        title: "מספר טלפון חסר",
        description: "יש להזין מספר טלפון ללקוח כדי לשלוח וואטסאפ",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header Section */}
      <div className="bg-brand-primary">
        <div className="container mx-auto px-4 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white/90 border border-white/20 mb-6">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            מערכת חשבוניות מתקדמת
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            חשבונית מס
            <span className="block text-2xl md:text-3xl font-medium text-white/80 mt-2">
              יצירה מקצועית ומהירה
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            צור חשבוניות מס מקצועיות בקליק אחד עם התאמה אוטומטית ללקוחות ורכבים שלך
          </p>
        </div>
      </div>

      {/* Main Container with better spacing */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Save Status Indicator */}
        {isSaved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">החשבונית נשמרה בענן</span>
          </div>
        )}
        
        <div className="space-y-8">
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Header Information Card */}
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-brand-primary">
                    <div className="w-3 h-8 bg-gradient-to-b from-brand-primary to-brand-secondary rounded-full"></div>
                    פרטי החשבונית
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-base font-semibold text-slate-700">תאריך</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-right font-normal h-12 rounded-xl border-2 border-slate-200 hover:border-brand-primary transition-all",
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
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date("1900-01-01")}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">כותרת</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="חשבונית מס" 
                              className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">מטבע</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all">
                                <SelectValue placeholder="בחר מטבע" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-2">
                              <SelectItem value="ILS">שקל ישראלי (₪)</SelectItem>
                              <SelectItem value="USD">דולר אמריקאי ($)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">שיוך ללקוח (אופציונלי)</FormLabel>
                          <CustomerAndLeadSearchSelect
                            value={selectedEntity}
                            onValueChange={handleEntitySelect}
                            placeholder="בחר לקוח או ליד מהרשימה"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">שיוך לרכב (אופציונלי)</FormLabel>
<CarSearchSelect
  value={field.value}
  onValueChange={field.onChange}
  placeholder="בחר רכב מהרשימה"
  includeNoneOption={true}
  noneValue="no-car"
/>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information Card */}
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-brand-primary">
                    <div className="w-3 h-8 bg-gradient-to-b from-brand-primary to-brand-secondary rounded-full"></div>
                    פרטי הלקוח
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8 md:p-10">
                  {/* Customer Type Selection */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <FormField
                      control={form.control}
                      name="customerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">סוג לקוח</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-white focus:border-brand-primary transition-all">
                                <SelectValue placeholder="בחר סוג לקוח" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-2">
                              <SelectItem value="individual">לקוח פרטי</SelectItem>
                              <SelectItem value="business">חברה/עסק</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Business Customer Fields */}
                  {watchedFields.customerType === 'business' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 space-y-6">
                      <h4 className="text-lg font-semibold text-brand-secondary flex items-center gap-2">
                        <div className="w-2 h-6 bg-brand-secondary rounded-full"></div>
                        פרטי החברה
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerCompanyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-slate-700">שם החברה</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="שם החברה" 
                                  className="h-12 rounded-xl border-2 border-slate-200 bg-white focus:border-brand-primary transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerContactPerson"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-slate-700">איש קשר (אופציונלי)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="שם איש הקשר" 
                                  className="h-12 rounded-xl border-2 border-slate-200 bg-white focus:border-brand-primary transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">
                            {watchedFields.customerType === 'business' ? 'שם איש קשר עיקרי' : 'שם מלא'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={watchedFields.customerType === 'business' ? 'שם איש הקשר' : 'שם מלא'} 
                              className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                            />
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
                          <FormLabel className="text-base font-semibold text-slate-700">
                            {watchedFields.customerType === 'business' ? 'ח.פ החברה' : 'ת.ז'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={watchedFields.customerType === 'business' ? '123456789' : '123456789'} 
                              className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">כתובת</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="כתובת מלאה" 
                            className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                          />
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
                        <FormLabel className="text-base font-semibold text-slate-700">טלפון</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="050-1234567" 
                            className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </CardContent>
               </Card>

                 {/* Items Card */}
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                  <CardTitle className="text-xl font-bold flex items-center justify-between text-brand-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-8 bg-gradient-to-b from-brand-primary to-brand-secondary rounded-full"></div>
                      פריטים
                    </div>
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      size="lg" 
                      className="bg-brand-primary hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      הוסף פריט
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                  <div className="space-y-8">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-2 border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xl flex items-center gap-3 text-brand-primary">
                            <div className="w-3 h-8 bg-gradient-to-b from-brand-primary to-brand-secondary rounded-full"></div>
                            פריט {index + 1}
                          </h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              size="sm"
                              variant="destructive"
                              className="hover:scale-105 transition-transform duration-200 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                          <div className="lg:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold text-slate-700">תיאור</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="תיאור הפריט" 
                                      className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold text-slate-700">כמות</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                                  />
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
                                <FormLabel className="text-base font-semibold text-slate-700">מחיר יחידה</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
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
                              <FormItem>
                                <FormLabel className="text-base font-semibold text-slate-700">מע"מ</FormLabel>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-brand-primary"
                                    />
                                  </FormControl>
                                  <span className="text-sm font-medium text-slate-600">
                                    {field.value ? 'עם מע"מ' : 'ללא מע"מ'}
                                  </span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {watchedFields.items[index]?.includeVat && (
                            <FormField
                              control={form.control}
                              name={`items.${index}.vatRate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold text-slate-700">אחוז מע"מ</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <div className="text-center bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 p-4 rounded-xl border border-brand-primary/20">
                          <span className="text-lg font-semibold text-slate-600">סכום כולל: </span>
                          <span className="text-xl font-bold text-brand-primary">{watchedFields.items[index]?.total?.toFixed(2) || '0.00'} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                        </div>
                      </div>
                    ))}
                   </div>

                  {/* Allocation Number Section */}
                  <div className="mt-10 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-slate-200 shadow-lg">
                    <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                      <div className="w-2 h-6 bg-brand-primary rounded-full"></div>
                      מספר הקצאה
                    </h3>
                    
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="allocationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-700">סוג הקצאה</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all">
                                  <SelectValue placeholder="בחר סוג הקצאה" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border-2">
                                <SelectItem value="manual">הוסף מספר הקצאה ידני</SelectItem>
                                <SelectItem value="request">בקש מספר הקצאה</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchedFields.allocationType === 'manual' && (
                        <FormField
                          control={form.control}
                          name="allocationNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-slate-700">מספר הקצאה</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="הזן מספר הקצאה" 
                                  className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {watchedFields.allocationType === 'request' && (
                        <FormField
                          control={form.control}
                          name="allocationCustomerType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-slate-700">הלקוח הוא</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all">
                                    <SelectValue placeholder="בחר סוג לקוח" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-2">
                                  <SelectItem value="individual">עוסק</SelectItem>
                                  <SelectItem value="business">חברה</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Notes and Payment Terms Section */}
                  <div className="mt-8 space-y-6">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">הערות</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="הערות נוספות..." 
                              className="min-h-[100px] rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-slate-700">תנאי תשלום</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="תשלום מיידי" 
                              className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-10 p-8 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-indigo-50 rounded-2xl border-2 border-brand-primary/20 shadow-lg">
                    <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                      <div className="w-2 h-6 bg-brand-primary rounded-full"></div>
                      סיכום פיננסי
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-slate-200">
                        <span className="text-lg font-semibold text-slate-700">סכום ללא מע"מ:</span>
                        <span className="text-lg font-bold text-slate-800">{subtotal.toFixed(2)} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-200">
                        <span className="text-lg font-semibold text-slate-700">מע"מ:</span>
                         <span className="text-lg font-bold text-slate-800">{vatAmount.toFixed(2)} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                       </div>
                       <div className="flex justify-between items-center py-6 bg-brand-primary rounded-xl px-6 text-white shadow-lg">
                         <span className="text-2xl font-bold">סכום כולל:</span>
                         <span className="text-3xl font-bold">{totalAmount.toFixed(2)} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                       </div>
                    </div>
                   </div>
                </CardContent>
              </Card>

              {/* Modern Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  size="lg"
                  className="flex-1 h-16 text-lg font-bold bg-brand-primary hover:bg-brand-primary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>יוצר מסמך מקצועי...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <span>יצירת חשבונית מס</span>
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWhatsAppSend}
                  disabled={!watchedFields.customerPhone}
                  size="lg"
                  className="flex-1 h-16 text-lg font-bold border-2 border-brand-primary/30 bg-white hover:bg-brand-primary/5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:border-brand-primary/60 rounded-2xl text-brand-primary"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <span>שלח בוואטסאפ</span>
                  </div>
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Modern Preview Section */}
        <div className="w-full">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
              <CardTitle className="text-xl font-bold flex items-center justify-between text-brand-primary">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-8 bg-gradient-to-b from-brand-primary to-brand-secondary rounded-full"></div>
                  תצוגה מקדימה
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-full text-sm font-semibold text-brand-primary border border-brand-primary/20">
                  Preview
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <TaxInvoicePreview data={previewData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}