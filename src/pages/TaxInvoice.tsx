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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Download, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useLeads } from '@/hooks/use-leads';
import { useCars } from '@/hooks/use-cars';
import { useProfile } from '@/hooks/use-profile';
import { TaxInvoicePreview } from '@/components/tax-invoice/TaxInvoicePreview';
import { generateTaxInvoicePDF } from '@/utils/tax-invoice-pdf-generator';
import { useTaxInvoice } from '@/hooks/tax-invoice/use-tax-invoice';
import type { TaxInvoiceData, InvoiceItem } from '@/types/tax-invoice';

const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'תיאור הפריט נדרש'),
  quantity: z.number().min(0.01, 'כמות חייבת להיות גדולה מ-0'),
  unitPrice: z.number().min(0, 'מחיר יחידה חייב להיות חיובי'),
  vatRate: z.number().min(0).max(100, 'אחוז מע"מ חייב להיות בין 0 ל-100'),
  total: z.number(),
});

const taxInvoiceSchema = z.object({
  date: z.date({ required_error: 'תאריך נדרש' }),
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
  customerName: z.string().min(1, 'שם הלקוח נדרש'),
  customerAddress: z.string().min(1, 'כתובת הלקוח נדרשת'),
  customerHp: z.string().min(1, 'ח.פ/ת.ז הלקוח נדרש'),
  customerPhone: z.string().min(1, 'טלפון הלקוח נדרש'),
  
  // Items
  items: z.array(invoiceItemSchema).min(1, 'לפחות פריט אחד נדרש'),
  
  // Additional
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type TaxInvoiceFormData = z.infer<typeof taxInvoiceSchema>;

export default function TaxInvoice() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { leads = [] } = useLeads();
  const { cars = [] } = useCars();
  const { profile } = useProfile();
  const { createTaxInvoice } = useTaxInvoice();

  const form = useForm<TaxInvoiceFormData>({
    resolver: zodResolver(taxInvoiceSchema),
    defaultValues: {
      date: new Date(),
      title: 'חשבונית מס',
      currency: 'ILS',
      companyName: profile?.company_name || '',
      companyAddress: '',
      companyHp: '',
      companyPhone: profile?.phone || '',
      companyAuthorizedDealer: false,
      customerName: '',
      customerAddress: '',
      customerHp: '',
      customerPhone: '',
      items: [{
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 17,
        total: 0
      }] as InvoiceItem[],
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

  // Update customer info when lead is selected
  useEffect(() => {
    if (selectedLead) {
      form.setValue('customerName', selectedLead.name);
      form.setValue('customerPhone', selectedLead.phone || '');
    }
  }, [selectedLead, form]);

  // Calculate totals for each item
  useEffect(() => {
    const items = watchedFields.items as InvoiceItem[];
    items.forEach((item, index) => {
      const subtotal = item.quantity * item.unitPrice;
      const vatAmount = subtotal * (item.vatRate / 100);
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
      total: 0
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
  const vatAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate / 100), 0);
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
      name: watchedFields.customerName,
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
    leadId: watchedFields.leadId,
    carId: watchedFields.carId
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
          name: data.customerName,
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
          total: Number(item.total) || 0
        })) as InvoiceItem[],
        subtotal,
        vatAmount,
        totalAmount,
        notes: data.notes,
        paymentTerms: data.paymentTerms,
        leadId: data.leadId,
        carId: data.carId
      };

      const savedInvoice = await createTaxInvoice(invoiceData);
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
    const message = `שלום ${watchedFields.customerName},\n\nמצורפת חשבונית מס: ${watchedFields.title}\nסכום: ${totalAmount.toFixed(2)} ${watchedFields.currency === 'ILS' ? '₪' : '$'}\n\nתודה!`;
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
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Form Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">חשבונית מס</h1>
            <p className="text-muted-foreground">יצירת חשבונית מס חדשה</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Header Information */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי החשבונית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>תאריך</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                          <FormLabel>כותרת</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="חשבונית מס" />
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
                          <FormLabel>מטבע</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר מטבע" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ILS">שקל ישראלי (₪)</SelectItem>
                              <SelectItem value="USD">דולר אמריקאי ($)</SelectItem>
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
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שיוך ללקוח (אופציונלי)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר לקוח מהרשימה" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">ללא שיוך ללקוח</SelectItem>
                              {leads.map((lead) => (
                                <SelectItem key={lead.id} value={lead.id}>
                                  {lead.name} - {lead.phone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שיוך לרכב (אופציונלי)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="בחר רכב מהרשימה" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">ללא שיוך לרכב</SelectItem>
                              {cars.map((car) => (
                                <SelectItem key={car.id} value={car.id}>
                                  {car.make} {car.model} - {car.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי החברה</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם החברה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם החברה" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyHp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מספר עוסק מורשה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123456789" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כתובת החברה</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="רחוב 123, עיר, מיקוד" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>טלפון החברה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="050-1234567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyAuthorizedDealer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              עוסק מורשה
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי הלקוח</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>שם הלקוח</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="שם הלקוח" />
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
                          <FormLabel>ח.פ / ת.ז</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123456789" />
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
                        <FormLabel>כתובת הלקוח</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="רחוב 456, עיר, מיקוד" />
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
                        <FormLabel>טלפון הלקוח</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="050-9876543" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    פריטים
                    <Button type="button" onClick={addItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      הוסף פריט
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">פריט {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>תיאור</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="תיאור הפריט" />
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
                                <FormLabel>כמות</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                <FormLabel>מחיר יחידה</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.vatRate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>אחוז מע"מ</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="text-left">
                          <span className="font-medium">סכום כולל: </span>
                          <span>{watchedFields.items[index]?.total?.toFixed(2) || '0.00'} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>סכום ללא מע"מ:</span>
                        <span>{subtotal.toFixed(2)} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>מע"מ:</span>
                        <span>{vatAmount.toFixed(2)} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>סכום כולל:</span>
                        <span>{totalAmount.toFixed(2)} {watchedFields.currency === 'ILS' ? '₪' : '$'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>מידע נוסף</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תנאי תשלום</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="תשלום מיידי" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>הערות</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="הערות נוספות..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>טוען...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      יצירת מסמך
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWhatsAppSend}
                  disabled={!watchedFields.customerPhone}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  שלח וואטסאפ
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-1/3 min-w-[400px] border-r bg-muted/30">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">תצוגה מקדימה</h2>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
          <TaxInvoicePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}