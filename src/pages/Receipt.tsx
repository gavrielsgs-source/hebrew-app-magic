import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, MessageCircle, Plus, Trash2, Banknote, CreditCard, Building2, Car, Receipt as ReceiptIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { CustomerAndLeadSearchSelect } from '@/components/customers/CustomerAndLeadSearchSelect';
import { useCustomers } from '@/hooks/customers';
import { useProfile } from '@/hooks/use-profile';
import { generateReceiptPDF } from '@/utils/receipt-pdf-generator';
import { useReceipt } from '@/hooks/receipt/use-receipt';
import type { ReceiptData, ReceiptPayment } from '@/types/receipt';
import { formatPhoneForWhatsApp } from '@/utils/phone-utils';
import { useUploadProductionDocument } from '@/hooks/use-upload-production-document';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileContainer } from '@/components/mobile/MobileContainer';
import { MobileDocumentHeader } from '@/components/mobile/MobileDocumentHeader';

const paymentSchema = z.object({
  id: z.string(),
  type: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'other', 'tax_deduction', 'vehicle']),
  amount: z.number().min(0),
  date: z.date(),
  reference: z.string().optional(),
});

const receiptSchema = z.object({
  date: z.date({ required_error: 'תאריך נדרש' }),
  branch: z.string().min(1, 'סניף נדרש'),
  language: z.enum(['hebrew', 'english']),
  currency: z.enum(['ILS', 'USD']),
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

  // Receipt for type
  receiptForType: z.enum(['none', 'tax_invoice', 'receipt_cancellation']),

  // Notes
  notes: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

type PaymentType = 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other' | 'tax_deduction' | 'vehicle';

const PAYMENT_TABS: { id: PaymentType; label: string; icon: React.ElementType }[] = [
  { id: 'cash', label: 'מזומן', icon: Banknote },
  { id: 'check', label: 'המחאות', icon: FileText },
  { id: 'credit_card', label: 'כרטיסי אשראי', icon: CreditCard },
  { id: 'bank_transfer', label: 'העברות בנקאיות', icon: Building2 },
  { id: 'other', label: 'אחר', icon: ReceiptIcon },
  { id: 'tax_deduction', label: 'ניכוי מס במקור', icon: FileText },
  { id: 'vehicle', label: 'רכבים', icon: Car },
];

export default function Receipt() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedReceiptData, setSavedReceiptData] = useState<ReceiptData | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'customer' | 'lead'; id: string } | null>(null);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentType>('cash');
  const [payments, setPayments] = useState<Record<PaymentType, { amount: string; date: Date; reference?: string; [key: string]: any }[]>>({
    cash: [{ amount: '', date: new Date() }],
    check: [],
    credit_card: [],
    bank_transfer: [],
    other: [],
    tax_deduction: [],
    vehicle: [],
  });
  
  const isMobile = useIsMobile();
  const { data: customers = [] } = useCustomers();
  const { profile } = useProfile();
  const { createReceipt, isCreating } = useReceipt();
  const { mutateAsync: uploadDocument, isPending: isUploading } = useUploadProductionDocument();

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      date: new Date(),
      branch: 'סניף ראשי',
      language: 'hebrew',
      currency: 'ILS',
      title: 'קבלה',
      companyName: profile?.company_name || '',
      companyAddress: '',
      companyHp: '',
      companyPhone: profile?.phone || '',
      companyAuthorizedDealer: false,
      customerName: '',
      customerAddress: '',
      customerHp: '',
      customerPhone: '',
      receiptForType: 'none',
      notes: ''
    }
  });

  const watchedFields = form.watch();

  // Update company info when profile loads
  useEffect(() => {
    if (profile) {
      form.setValue('companyName', profile.company_name || '');
      form.setValue('companyPhone', profile.phone || '');
    }
  }, [profile, form]);

  const handleEntitySelect = (value: { type: 'customer' | 'lead'; id: string; data: any }) => {
    setSelectedEntity(value);
    
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

  const addPayment = (type: PaymentType) => {
    setPayments(prev => ({
      ...prev,
      [type]: [...prev[type], { amount: '', date: new Date() }]
    }));
  };

  const removePayment = (type: PaymentType, index: number) => {
    setPayments(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updatePayment = (type: PaymentType, index: number, field: string, value: any) => {
    setPayments(prev => ({
      ...prev,
      [type]: prev[type].map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const calculateTotals = () => {
    const totals = {
      cash: payments.cash.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      check: payments.check.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      creditCard: payments.credit_card.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      bankTransfer: payments.bank_transfer.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      other: payments.other.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      taxDeduction: payments.tax_deduction.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      vehicle: payments.vehicle.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      totalWithTaxDeduction: 0,
      grandTotal: 0,
    };
    
    totals.grandTotal = totals.cash + totals.check + totals.creditCard + totals.bankTransfer + totals.other + totals.vehicle;
    totals.totalWithTaxDeduction = totals.grandTotal + totals.taxDeduction;
    
    return totals;
  };

  const totals = calculateTotals();

  const onSubmit = async (data: ReceiptFormData) => {
    try {
      setIsGenerating(true);
      
      const allPayments: ReceiptPayment[] = [];
      Object.entries(payments).forEach(([type, paymentList]) => {
        paymentList.forEach((p, index) => {
          const amount = parseFloat(p.amount) || 0;
          if (amount > 0) {
            allPayments.push({
              id: `${type}-${index}`,
              type: type as PaymentType,
              amount: amount,
              date: p.date.toISOString(),
              reference: p.reference,
            });
          }
        });
      });

      const receiptData: Omit<ReceiptData, 'receiptNumber'> = {
        date: data.date.toISOString(),
        branch: data.branch,
        language: data.language,
        currency: data.currency,
        title: data.title,
        company: {
          name: data.companyName,
          address: data.companyAddress,
          hp: data.companyHp,
          phone: data.companyPhone,
          authorizedDealer: data.companyAuthorizedDealer,
        },
        customer: {
          name: data.customerName,
          address: data.customerAddress,
          hp: data.customerHp,
          phone: data.customerPhone,
        },
        receiptForType: data.receiptForType,
        payments: allPayments,
        totals,
        notes: data.notes,
        customerId: selectedEntity?.type === 'customer' ? selectedEntity.id : undefined,
        leadId: selectedEntity?.type === 'lead' ? selectedEntity.id : undefined,
      };

      const result = await createReceipt(receiptData);
      setSavedReceiptData(result);
      setIsSaved(true);
      
      toast({
        title: "הקבלה נוצרה בהצלחה",
        description: `מספר קבלה: ${result.receiptNumber}`,
      });
      
      // Generate PDF and upload
      const pdfBlob = await generateReceiptPDF(result, true) as Blob;
      const url = await uploadDocument({
        pdfBlob,
        documentType: 'receipt',
        documentNumber: result.receiptNumber,
        customerName: result.customer.name,
        entityType: selectedEntity?.type || undefined,
        entityId: selectedEntity?.id || undefined,
      });
      
      setDocumentUrl(url);
    } catch (error) {
      console.error('Error creating receipt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const dataToUse = savedReceiptData || {
        ...form.getValues(),
        receiptNumber: 'DRAFT',
        date: form.getValues('date').toISOString(),
        branch: form.getValues('branch'),
        language: form.getValues('language'),
        currency: form.getValues('currency'),
        title: form.getValues('title'),
        company: {
          name: form.getValues('companyName'),
          address: form.getValues('companyAddress'),
          hp: form.getValues('companyHp'),
          phone: form.getValues('companyPhone'),
          authorizedDealer: form.getValues('companyAuthorizedDealer'),
        },
        customer: {
          name: form.getValues('customerName'),
          address: form.getValues('customerAddress'),
          hp: form.getValues('customerHp'),
          phone: form.getValues('customerPhone'),
        },
        receiptForType: form.getValues('receiptForType'),
        payments: [],
        totals,
        notes: form.getValues('notes'),
      } as ReceiptData;

      await generateReceiptPDF(dataToUse);
      
      toast({
        title: "PDF הורד בהצלחה",
        description: "הקובץ נשמר למחשב שלך",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "שגיאה בהורדת PDF",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppSend = () => {
    const dataToUse = savedReceiptData || {
      receiptNumber: form.getValues('title'),
      company: { name: form.getValues('companyName') },
      customer: { name: form.getValues('customerName') },
      totals,
    };
    
    const message = `שלום ${dataToUse.customer?.name || ''},\n\nמצורפת קבלה מספר ${dataToUse.receiptNumber} מאת ${dataToUse.company?.name}.\n\nסה"כ שולם: ₪${totals.grandTotal.toLocaleString('he-IL', { minimumFractionDigits: 2 })}\n\nתודה רבה!`;
    
    const phone = formatPhoneForWhatsApp(watchedFields.customerPhone);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Payment Tab Content Component
  const PaymentTabContent = ({ type }: { type: PaymentType }) => {
    const paymentList = payments[type];

    // מזומן - Cash: Date, Amount only
    if (type === 'cash') {
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-3 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>תאריך</span>
            <span>סכום</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl min-w-[140px] justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(payment.date, "dd/MM/yyyy", { locale: he })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                inputMode="decimal"
                value={payment.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  updatePayment(type, index, 'amount', value);
                }}
                placeholder="סכום"
                className="flex-1 h-10 rounded-xl text-right"
              />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    // המחאות - Checks: Date, Account Number, Branch Number, Bank Number, Check Number, Total
    if (type === 'check') {
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-7 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>תאריך</span>
            <span>מספר חשבון</span>
            <span>מספר סניף</span>
            <span>מספר בנק</span>
            <span>מספר המחאה</span>
            <span>סה"כ</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(payment.date, "dd/MM/yyyy", { locale: he })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="text" inputMode="numeric" value={(payment as any).accountNumber || ''} onChange={(e) => updatePayment(type, index, 'accountNumber', e.target.value)} placeholder="מספר חשבון" className="flex-1 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="numeric" value={(payment as any).branchNumber || ''} onChange={(e) => updatePayment(type, index, 'branchNumber', e.target.value)} placeholder="מספר סניף" className="w-24 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="numeric" value={(payment as any).bankNumber || ''} onChange={(e) => updatePayment(type, index, 'bankNumber', e.target.value)} placeholder="מספר בנק" className="w-24 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="numeric" value={(payment as any).checkNumber || ''} onChange={(e) => updatePayment(type, index, 'checkNumber', e.target.value)} placeholder="מספר המחאה" className="w-28 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-24 h-10 rounded-xl text-right" />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    // כרטיסי אשראי - Credit Cards: Date, Last 4 Digits, Expiry, Card Type, ID/HP, Installments, Total
    if (type === 'credit_card') {
      const cardTypes = ['Mastercard', 'Diners', 'Visa', 'American Express', 'Maestro', 'ישראכרט'];
      const installmentOptions = Array.from({ length: 120 }, (_, i) => i + 1);
      
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-8 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>תאריך</span>
            <span>4 ספרות אחרונות</span>
            <span>תוקף</span>
            <span>סוג כרטיס</span>
            <span>ת.ז/ח.פ</span>
            <span>תשלומים</span>
            <span>סה"כ</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl min-w-[110px] justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(payment.date, "dd/MM/yyyy", { locale: he })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="text" inputMode="numeric" maxLength={4} value={(payment as any).lastFourDigits || ''} onChange={(e) => updatePayment(type, index, 'lastFourDigits', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4 ספרות" className="w-20 h-10 rounded-xl text-right" />
              <Input type="text" value={(payment as any).expiryDate || ''} onChange={(e) => updatePayment(type, index, 'expiryDate', e.target.value)} placeholder="MM/YY" className="w-20 h-10 rounded-xl text-right" />
              <Select value={(payment as any).cardType || ''} onValueChange={(val) => updatePayment(type, index, 'cardType', val)}>
                <SelectTrigger className="w-32 h-10 rounded-xl">
                  <SelectValue placeholder="סוג כרטיס" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  {cardTypes.map((ct) => (
                    <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="text" inputMode="numeric" value={(payment as any).idNumber || ''} onChange={(e) => updatePayment(type, index, 'idNumber', e.target.value)} placeholder="ת.ז/ח.פ" className="w-28 h-10 rounded-xl text-right" />
              <Select value={String((payment as any).installments || '1')} onValueChange={(val) => updatePayment(type, index, 'installments', parseInt(val))}>
                <SelectTrigger className="w-24 h-10 rounded-xl">
                  <SelectValue placeholder="תשלומים" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background max-h-60">
                  {installmentOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-24 h-10 rounded-xl text-right" />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    // העברות בנקאיות - Bank Transfer: Date, Account Number, Branch Number, Bank Number, Total
    if (type === 'bank_transfer') {
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-6 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>תאריך</span>
            <span>מספר חשבון</span>
            <span>מספר סניף</span>
            <span>מספר בנק</span>
            <span>סה"כ</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(payment.date, "dd/MM/yyyy", { locale: he })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="text" inputMode="numeric" value={(payment as any).accountNumber || ''} onChange={(e) => updatePayment(type, index, 'accountNumber', e.target.value)} placeholder="מספר חשבון" className="flex-1 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="numeric" value={(payment as any).branchNumber || ''} onChange={(e) => updatePayment(type, index, 'branchNumber', e.target.value)} placeholder="מספר סניף" className="w-24 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="numeric" value={(payment as any).bankNumber || ''} onChange={(e) => updatePayment(type, index, 'bankNumber', e.target.value)} placeholder="מספר בנק" className="w-24 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-24 h-10 rounded-xl text-right" />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    // אחר - Other: Date, Payment Type (free text), Amount
    if (type === 'other') {
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-4 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>תאריך</span>
            <span>סוג תשלום</span>
            <span>סכום</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(payment.date, "dd/MM/yyyy", { locale: he })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="text" value={(payment as any).paymentType || ''} onChange={(e) => updatePayment(type, index, 'paymentType', e.target.value)} placeholder="סוג תשלום" className="flex-1 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סכום" className="w-28 h-10 rounded-xl text-right" />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    // ניכוי מס במקור - Tax Deduction: Amount only
    if (type === 'tax_deduction') {
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-2 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>סכום</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סכום ניכוי מס במקור" className="flex-1 h-10 rounded-xl text-right" />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    // רכבים - Vehicles: Date, Vehicle (License Plate), Total
    if (type === 'vehicle') {
      return (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-4 gap-2 text-sm text-muted-foreground text-right px-2">
            <span>תאריך</span>
            <span>רכב (מספר רישוי)</span>
            <span>סה"כ</span>
            <span></span>
          </div>
          {paymentList.map((payment, index) => (
            <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-muted/30 rounded-xl">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl min-w-[120px] justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(payment.date, "dd/MM/yyyy", { locale: he })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar mode="single" selected={payment.date} onSelect={(date) => date && updatePayment(type, index, 'date', date)} locale={he} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="text" value={(payment as any).licensePlate || ''} onChange={(e) => updatePayment(type, index, 'licensePlate', e.target.value)} placeholder="מספר רישוי" className="flex-1 h-10 rounded-xl text-right" />
              <Input type="text" inputMode="decimal" value={payment.amount} onChange={(e) => { const value = e.target.value.replace(/[^0-9.]/g, ''); updatePayment(type, index, 'amount', value); }} placeholder="סה״כ" className="w-28 h-10 rounded-xl text-right" />
              {paymentList.length > 0 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(type, index)} className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="default" onClick={() => addPayment(type)} className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            הוסף תשלום
          </Button>
        </div>
      );
    }

    return null;
  };

  // Summary Card Component
  const SummaryCard = ({ className = "" }: { className?: string }) => (
    <Card className={cn("shadow-xl rounded-2xl border-0 overflow-hidden", className)}>
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 p-5 text-white">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>סה"כ מזומן</span>
            <span>₪ {totals.cash.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ המחאות</span>
            <span>₪ {totals.check.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ כרטיסי אשראי</span>
            <span>₪ {totals.creditCard.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ העברות בנקאיות</span>
            <span>₪ {totals.bankTransfer.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ אחר</span>
            <span>₪ {totals.other.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ ניכוי מס במקור</span>
            <span>₪ {totals.taxDeduction.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ רכבים</span>
            <span>₪ {totals.vehicle.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>סה"כ כולל ניכוי מס במקור</span>
            <span>₪ {totals.totalWithTaxDeduction.toLocaleString('he-IL', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/30">
          <div className="text-center">
            <span className="text-sm opacity-80">סה"כ שולם</span>
            <div className="text-3xl font-bold mt-1">
              ₪ {totals.grandTotal.toLocaleString('he-IL', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileContainer>
        <MobileDocumentHeader 
          title="קבלה"
        />
        
        <div className="px-4 pb-56 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* General Info Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg">מידע כללי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">תאריך</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="w-full h-11 rounded-xl justify-start text-right">
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                {field.value ? format(field.value, "dd MMMM yyyy", { locale: he }) : "בחר תאריך"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={he} />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  {/* Branch */}
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">סניף</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="סניף ראשי">סניף ראשי</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Customer Selection */}
                  <div>
                    <Label className="text-sm">לקוח</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="flex-1">
                        <CustomerAndLeadSearchSelect
                          onValueChange={handleEntitySelect}
                          placeholder="התחל להקליד את שם הלקוח המבוקש..."
                        />
                      </div>
                      <Dialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" className="h-11 rounded-xl bg-primary">
                            לקוח חדש
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>הוספת לקוח חדש</DialogTitle>
                          </DialogHeader>
                          <p className="text-muted-foreground text-center py-4">בקרוב...</p>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">כותרת</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 rounded-xl text-right" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                </CardContent>
              </Card>

              {/* Receipt For Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-amber-50 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg">קבלה עבור</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <FormField
                    control={form.control}
                    name="receiptForType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-wrap gap-4 justify-end"
                          >
                            <div className="flex items-center gap-2">
                              <Label htmlFor="m_none" className="cursor-pointer text-sm">ללא מסמך משוייך</Label>
                              <RadioGroupItem value="none" id="m_none" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="m_tax_invoice" className="cursor-pointer text-sm">חשבונית מס</Label>
                              <RadioGroupItem value="tax_invoice" id="m_tax_invoice" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="m_cancel" className="cursor-pointer text-sm">ביטול קבלה</Label>
                              <RadioGroupItem value="receipt_cancellation" id="m_cancel" />
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payments Card */}
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-indigo-50 to-transparent border-b pb-3">
                  <CardTitle className="text-right text-lg">הוספת תשלומים</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Tabs value={activePaymentTab} onValueChange={(v) => setActivePaymentTab(v as PaymentType)}>
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl mb-4">
                      {PAYMENT_TABS.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex-1 min-w-[80px] text-xs py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {PAYMENT_TABS.map((tab) => (
                      <TabsContent key={tab.id} value={tab.id}>
                        <PaymentTabContent type={tab.id} />
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Notes Card */}
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
              <SummaryCard />

              {/* Fixed Action Buttons */}
              <div className="fixed bottom-28 left-0 right-0 p-3 bg-background border-t shadow-lg z-50">
                <div className="space-y-1.5 max-w-md mx-auto">
                  <Button
                    type="submit"
                    disabled={isGenerating || isCreating || isUploading}
                    className="w-full h-11 rounded-xl text-base font-bold bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating || isCreating ? "טוען..." : "הפק מסמך"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={handleDownloadPDF} className="h-9 rounded-xl">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                    <Button type="button" onClick={handleWhatsAppSend} disabled={!watchedFields.customerPhone} className="h-9 rounded-xl bg-green-600">
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
        <h1 className="text-4xl font-bold bg-gradient-to-l from-purple-600 to-indigo-400 bg-clip-text text-transparent mb-2">
          קבלה
        </h1>
        <p className="text-muted-foreground text-lg">
          צור קבלה חדשה עם פירוט תשלומים
        </p>
      </div>
      
      {/* Save Status Indicator */}
      {isSaved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">הקבלה נשמרה בענן</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Information */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-purple-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">מידע כללי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תאריך</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full h-12 rounded-xl justify-start text-right", !field.value && "text-muted-foreground")}>
                                  <CalendarIcon className="ml-2 h-4 w-4" />
                                  {field.value ? format(field.value, "dd MMMM yyyy", { locale: he }) : "בחר תאריך"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={he} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Branch */}
                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סניף</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder="בחר סניף" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="סניף ראשי">סניף ראשי</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <Label>לקוח</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <CustomerAndLeadSearchSelect
                          onValueChange={handleEntitySelect}
                          placeholder="התחל להקליד את שם הלקוח המבוקש..."
                        />
                      </div>
                      <Dialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button type="button" className="h-12 rounded-xl bg-primary">
                            לקוח חדש
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>הוספת לקוח חדש</DialogTitle>
                          </DialogHeader>
                          <p className="text-muted-foreground text-center py-4">בקרוב...</p>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>


                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כותרת</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-12 rounded-xl text-right" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Receipt For */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-amber-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">קבלה עבור</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="receiptForType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-6 justify-end"
                          >
                            <div className="flex items-center gap-2">
                              <Label htmlFor="none" className="cursor-pointer">ללא מסמך משוייך</Label>
                              <RadioGroupItem value="none" id="none" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="tax_invoice" className="cursor-pointer">חשבונית מס</Label>
                              <RadioGroupItem value="tax_invoice" id="tax_invoice" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="receipt_cancellation" className="cursor-pointer">ביטול קבלה</Label>
                              <RadioGroupItem value="receipt_cancellation" id="receipt_cancellation" />
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payments */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-indigo-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">הוספת תשלומים</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs value={activePaymentTab} onValueChange={(v) => setActivePaymentTab(v as PaymentType)}>
                    <TabsList className="w-full justify-end bg-muted/50 p-1 rounded-xl mb-6">
                      {PAYMENT_TABS.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {PAYMENT_TABS.map((tab) => (
                      <TabsContent key={tab.id} value={tab.id}>
                        <PaymentTabContent type={tab.id} />
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-2 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-l from-slate-50 to-transparent border-b">
                  <CardTitle className="text-right text-xl">הערות</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="הערות נוספות..."
                            className="min-h-[120px] rounded-xl text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Summary Card */}
                <SummaryCard />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isGenerating || isCreating || isUploading}
                    className="w-full h-14 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating || isCreating ? "טוען..." : "הפק מסמך"}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDownloadPDF}
                      className="h-12 rounded-xl"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      הורד PDF
                    </Button>
                    <Button
                      type="button"
                      onClick={handleWhatsAppSend}
                      disabled={!watchedFields.customerPhone}
                      className="h-12 rounded-xl bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      וואטסאפ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
