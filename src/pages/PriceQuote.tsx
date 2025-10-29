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
import { cn, formatPrice } from "@/lib/utils";
import { PriceQuoteData } from "@/types/document-production";
import { useToast } from "@/hooks/use-toast";
import { LeadSearchSelect } from "@/components/leads/LeadSearchSelect";
import { useLeads } from "@/hooks/use-leads";
import { usePriceQuote } from "@/hooks/price-quote/use-price-quote";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { generatePriceQuotePDF } from "@/utils/price-quote-pdf-generator";

const priceQuoteSchema = z.object({
  date: z.string().min(1, "תאריך נדרש"),
  leadId: z.string().optional(),
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
  const { leads } = useLeads();
  const { createPriceQuote, isCreating } = usePriceQuote();
  const [showPreview, setShowPreview] = useState(false);
  const [savedQuoteData, setSavedQuoteData] = useState<PriceQuoteData | null>(null);
  const [useExistingLead, setUseExistingLead] = useState(false);

  const form = useForm<PriceQuoteFormValues>({
    resolver: zodResolver(priceQuoteSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
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
  const subtotal = watchedItems.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
  const totalDiscount = watchedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = subtotal - totalDiscount;

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => lead.id === leadId);
    if (selectedLead) {
      form.setValue("customer.fullName", selectedLead.name || "");
      form.setValue("customer.firstName", selectedLead.name?.split(' ')[0] || "");
      form.setValue("customer.phone", selectedLead.phone || "");
      form.setValue("customer.email", selectedLead.email || "");
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
          total,
        },
        terms: data.terms,
        notes: data.notes,
      };

      const result = await createPriceQuote(quoteData);
      setSavedQuoteData(result);
      setShowPreview(true);
      
      toast({
        title: "הצעת המחיר נשמרה בהצלחה",
        description: `מספר הצעה: ${result.quoteNumber}`,
      });
    } catch (error) {
      console.error("Error saving price quote:", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!savedQuoteData) return;
    
    try {
      await generatePriceQuotePDF(savedQuoteData);
      toast({
        title: "הצעת המחיר הורדה בהצלחה",
        description: `קובץ PDF של הצעה ${savedQuoteData.quoteNumber} נשמר למחשב`,
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
    if (!savedQuoteData) return;
    
    const message = `שלום ${savedQuoteData.customer.firstName || savedQuoteData.customer.fullName},\n\nמצורפת הצעת מחיר מספר: ${savedQuoteData.quoteNumber}\nסכום כולל: ${savedQuoteData.financial.total.toFixed(2)} ₪\n\nתוקף ההצעה: ${new Date(savedQuoteData.validUntil).toLocaleDateString('he-IL')}\n\nנשמח לעמוד לרשותך!`;
    const phone = savedQuoteData.customer.phone?.replace(/[^\d]/g, '');
    
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

  if (isMobile) {
    return (
      <MobileContainer withPadding={false} withBottomNav={true}>
        <MobileDocumentHeader 
          title="הצעת מחיר" 
          icon={<Calculator className="h-5 w-5" />}
        />
        <div className="p-4 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-right flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                הצעת מחיר
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Quote Details - Mobile */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">תאריך</Label>
                    <Input
                      id="date"
                      type="date"
                      {...form.register("date")}
                      className="text-right h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">תוקף עד</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      {...form.register("validUntil")}
                      className="text-right h-12"
                    />
                  </div>
                </div>

                <Separator />

                {/* Customer Information - Mobile */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right">פרטי הלקוח</h3>

                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={useExistingLead ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseExistingLead(true)}
                      className="flex-1 h-10"
                    >
                      בחר לקוח קיים
                    </Button>
                    <Button
                      type="button"
                      variant={!useExistingLead ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseExistingLead(false)}
                      className="flex-1 h-10 flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      לקוח חדש
                    </Button>
                  </div>

                  {useExistingLead && (
                    <div className="space-y-2">
                      <Label htmlFor="leadId">בחר לקוח מהרשימה</Label>
                      <LeadSearchSelect
                        value={form.watch("leadId") || ""}
                        onValueChange={handleLeadSelect}
                        placeholder="חפש לקוח..."
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">שם מלא</Label>
                      <Input
                        id="fullName"
                        {...form.register("customer.fullName")}
                        className="text-right h-12"
                        placeholder="שם מלא"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">טלפון</Label>
                      <Input
                        id="phone"
                        {...form.register("customer.phone")}
                        className="text-right h-12"
                        placeholder="050-1234567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("customer.email")}
                        className="text-right h-12"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">עיר</Label>
                      <Input
                        id="city"
                        {...form.register("customer.city")}
                        className="text-right h-12"
                        placeholder="תל אביב"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">כתובת</Label>
                      <Input
                        id="address"
                        {...form.register("customer.address")}
                        className="text-right h-12"
                        placeholder="רחוב הרצל 1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Items - Mobile */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      הוסף פריט
                    </Button>
                    <h3 className="text-lg font-semibold">פריטים</h3>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4 bg-muted/30">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              מחק
                            </Button>
                            <span className="font-medium">פריט {index + 1}</span>
                          </div>

                          <div className="space-y-2">
                            <Label>תיאור הפריט</Label>
                            <Textarea
                              {...form.register(`items.${index}.description`)}
                              className="text-right min-h-[80px]"
                              placeholder="תיאור הפריט..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>מחיר יחידה</Label>
                              <Input
                                type="number"
                                step="0.01"
                                {...form.register(`items.${index}.unitPrice`, { 
                                  valueAsNumber: true,
                                  onChange: (e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                                })}
                                className="text-right h-12"
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
                                className="text-right h-12"
                                placeholder="1"
                              />
                            </div>
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
                              className="text-right h-12"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>הערות</Label>
                            <Input
                              {...form.register(`items.${index}.notes`)}
                              className="text-right h-12"
                              placeholder="הערות לפריט"
                            />
                          </div>

                          <div className="p-3 bg-primary/10 rounded text-center">
                            <span className="font-bold text-lg">סה"כ: {formatPrice(watchedItems[index]?.totalPrice || 0)}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Additional Details - Mobile */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right">פרטים נוספים</h3>

                  <div className="space-y-2">
                    <Label htmlFor="terms">תנאים כלליים</Label>
                    <Textarea
                      id="terms"
                      {...form.register("terms")}
                      className="text-right min-h-[100px]"
                      placeholder="תנאי תשלום, תנאי אחריות וכו'..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea
                      id="notes"
                      {...form.register("notes")}
                      className="text-right min-h-[80px]"
                      placeholder="הערות נוספות להצעה..."
                    />
                  </div>
                </div>

                {/* Financial Summary - Mobile */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-right">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                        <span>סכום חלקי:</span>
                      </div>
                      <div className="flex justify-between items-center text-destructive">
                        <span className="font-semibold">-{formatPrice(totalDiscount)}</span>
                        <span>סה"כ הנחות:</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-xl font-bold text-primary">
                        <span>{formatPrice(total)}</span>
                        <span>סה"כ לתשלום:</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full h-12" disabled={isCreating}>
                  {isCreating ? "שומר..." : "שמור הצעת מחיר"}
                </Button>
              </form>

              {showPreview && savedQuoteData && (
                <div className="mt-6 p-4 border rounded-lg bg-background">
                  <h3 className="text-lg font-semibold text-right mb-4">תצוגה מקדימה</h3>
                  <div className="space-y-4 text-right text-sm">
                    <div>
                      <strong>מספר הצעה:</strong> {savedQuoteData.quoteNumber}
                    </div>
                    <div>
                      <strong>תאריך:</strong> {new Date(savedQuoteData.date).toLocaleDateString('he-IL')}
                    </div>
                    <div>
                      <strong>לקוח:</strong> {savedQuoteData.customer.fullName}
                    </div>
                    <div>
                      <strong>סה"כ:</strong> {formatPrice(savedQuoteData.financial.total)}
                    </div>
                  </div>
                </div>
              )}

              {savedQuoteData && (
                <div className="space-y-3">
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    הורד PDF
                  </Button>
                  <Button
                    onClick={handleWhatsAppSend}
                    variant="default"
                    className="w-full h-12 bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    שלח בוואטסאפ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MobileContainer>
    );
  }

  // Desktop Layout
  return (
    <div className="w-full max-w-none">
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              הצעת מחיר
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Quote Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">תאריך</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-right font-normal",
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
                          "w-full justify-between text-right font-normal",
                          !form.watch("validUntil") && "text-muted-foreground"
                        )}
                      >
                        <span>{form.watch("validUntil") ? new Date(form.watch("validUntil")).toLocaleDateString('he-IL') : "בחר תאריך"}</span>
                        <CalendarIcon className="h-4 w-4 opacity-60" />
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

              <Separator />

              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={useExistingLead ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseExistingLead(true)}
                    >
                      בחר לקוח קיים
                    </Button>
                    <Button
                      type="button"
                      variant={!useExistingLead ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseExistingLead(false)}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      לקוח חדש
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold">פרטי הלקוח</h3>
                </div>

                {useExistingLead && (
                  <div className="space-y-2">
                    <Label htmlFor="leadId">בחר לקוח מהרשימה</Label>
                    <LeadSearchSelect
                      value={form.watch("leadId") || ""}
                      onValueChange={handleLeadSelect}
                      placeholder="חפש לקוח..."
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <Input
                      id="fullName"
                      {...form.register("customer.fullName")}
                      className="text-right"
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
                      className="text-right"
                      placeholder="050-1234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("customer.email")}
                      className="text-right"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">עיר</Label>
                    <Input
                      id="city"
                      {...form.register("customer.city")}
                      className="text-right"
                      placeholder="תל אביב"
                    />
                    {form.formState.errors.customer?.city && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">כתובת</Label>
                    <Input
                      id="address"
                      {...form.register("customer.address")}
                      className="text-right"
                      placeholder="רחוב הרצל 1"
                    />
                    {form.formState.errors.customer?.address && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button type="button" onClick={addItem} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    הוסף פריט
                  </Button>
                  <h3 className="text-lg font-semibold">פריטים</h3>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            מחק פריט
                          </Button>
                          <h4 className="font-medium">פריט {index + 1}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label>תיאור הפריט</Label>
                            <Textarea
                              {...form.register(`items.${index}.description`)}
                              className="text-right"
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
                              className="text-right"
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
                              className="text-right"
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
                              className="text-right"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>הערות</Label>
                            <Input
                              {...form.register(`items.${index}.notes`)}
                              className="text-right"
                              placeholder="הערות לפריט"
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold">סה"כ פריט: {formatPrice(watchedItems[index]?.totalPrice || 0)}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-right">פרטים נוספים</h3>

                <div className="space-y-2">
                  <Label htmlFor="terms">תנאים כלליים</Label>
                  <Textarea
                    id="terms"
                    {...form.register("terms")}
                    className="text-right min-h-[100px]"
                    placeholder="תנאי תשלום, תנאי אחריות וכו'..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    {...form.register("notes")}
                    className="text-right min-h-[80px]"
                    placeholder="הערות נוספות להצעה..."
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
                      <span>סכום חלקי:</span>
                    </div>
                    <div className="flex justify-between items-center text-destructive">
                      <span className="text-lg font-semibold">-{formatPrice(totalDiscount)}</span>
                      <span>סה"כ הנחות:</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>{formatPrice(total)}</span>
                      <span>סה"כ לתשלום:</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? "שומר..." : "שמור הצעת מחיר"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!showPreview && savedQuoteData && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2"
              size="lg"
            >
              <Download className="h-5 w-5" />
              הורד PDF
            </Button>
            <Button
              onClick={handleWhatsAppSend}
              variant="default"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              שלח בוואטסאפ
            </Button>
          </div>
        )}

        {/* Preview Section */}
        {showPreview && savedQuoteData && (
          <Card className="mt-8">
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
                  <div key={index} className="bg-muted/30 p-3 rounded mb-2">
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
    </div>
  );
}