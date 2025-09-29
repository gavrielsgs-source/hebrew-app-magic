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
import { Plus, Trash2, Calculator, Download, UserPlus, Calendar as CalendarIcon } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PriceQuoteData } from "@/types/document-production";
import { useToast } from "@/hooks/use-toast";
import { LeadSearchSelect } from "@/components/leads/LeadSearchSelect";
import { useLeads } from "@/hooks/use-leads";
import { usePriceQuote } from "@/hooks/price-quote/use-price-quote";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [useExistingLead, setUseExistingLead] = useState(true);
  const [savedQuoteData, setSavedQuoteData] = useState<PriceQuoteData | null>(null);
  const { leads } = useLeads();
  const { createPriceQuote, isCreating } = usePriceQuote();
  const isMobile = useIsMobile();

  const form = useForm<PriceQuoteFormValues>({
    resolver: zodResolver(priceQuoteSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      leadId: "",
      customer: {
        fullName: "",
        firstName: "",
        phone: "",
        email: "",
        city: "",
        address: "",
      },
      items: [{
        id: "1",
        description: "",
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        totalPrice: 0,
        notes: "",
      }],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      terms: "תנאי תשלום: 30 יום מיום הזמנה\nמחירים כוללים מע\"ם\nההצעה בתוקף למשך 30 יום",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const selectedDate = form.watch("date") ? new Date(form.watch("date")) : undefined;
  const selectedValidUntil = form.watch("validUntil") ? new Date(form.watch("validUntil")) : undefined;
  
  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalDiscount = watchedItems.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - totalDiscount;

  const addItem = () => {
    append({
      id: Date.now().toString(),
      description: "",
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      totalPrice: 0,
      notes: "",
    });
  };

  const calculateTotalPrice = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const totalPrice = (item.unitPrice * item.quantity) - item.discount;
      form.setValue(`items.${index}.totalPrice`, Math.max(0, totalPrice));
    }
  };

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => lead.id === leadId);
    if (selectedLead) {
      form.setValue("leadId", leadId);
      form.setValue("customer.fullName", selectedLead.name || "");
      form.setValue("customer.firstName", selectedLead.name?.split(" ")[0] || "");
      form.setValue("customer.phone", selectedLead.phone || "");
      form.setValue("customer.email", selectedLead.email || "");
      form.setValue("customer.city", "");
      form.setValue("customer.address", "");
    }
  };

  const onSubmit = async (data: PriceQuoteFormValues) => {
    try {
      const quoteData = await createPriceQuote({
        date: data.date,
        customer: {
          fullName: data.customer.fullName || '',
          firstName: data.customer.firstName || '',
          phone: data.customer.phone,
          email: data.customer.email,
          city: data.customer.city || '',
          address: data.customer.address || '',
        },
        items: data.items.map(item => ({
          id: item.id || '',
          description: item.description || '',
          unitPrice: item.unitPrice || 0,
          quantity: item.quantity || 1,
          discount: item.discount || 0,
          totalPrice: item.totalPrice || 0,
          notes: item.notes,
        })),
        validUntil: data.validUntil,
        terms: data.terms,
        notes: data.notes,
        financial: {
          subtotal: subtotal,
          totalDiscount: totalDiscount,
          total: total,
        },
      });
      
      setSavedQuoteData(quoteData);
      setShowPreview(true);
      
      toast({
        title: "הצלחה",
        description: "הצעת המחיר נשמרה בהצלחה",
      });
    } catch (error) {
      console.error('Error saving price quote:', error);
    }
  };

  const handleDownloadPDF = () => {
    toast({
      title: "בפיתוח",  
      description: "הורדת PDF תהיה זמינה בקרוב",
    });
  };

  if (isMobile) {
    return (
      <MobileContainer withPadding={false} withBottomNav={false}>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-between text-right font-normal",
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
                            if (date) {
                              form.setValue("date", date.toISOString().split('T')[0]);
                            }
                          }}
                          initialFocus
                          dir="rtl"
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>תוקף ההצעה</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-between text-right font-normal",
                            !form.watch("validUntil") && "text-muted-foreground"
                          )}
                        >
                          <span>{form.watch("validUntil") ? new Date(form.watch("validUntil")).toLocaleDateString('he-IL') : "בחר תאריך תוקף"}</span>
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={selectedValidUntil}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("validUntil", date.toISOString().split('T')[0]);
                            }
                          }}
                          initialFocus
                          dir="rtl"
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.validUntil && (
                      <p className="text-sm text-destructive">{form.formState.errors.validUntil.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Customer Information - Mobile */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">פרטי הלקוח</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={useExistingLead ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseExistingLead(true)}
                        className="w-full h-10"
                      >
                        בחר לקוח קיים
                      </Button>
                      <Button
                        type="button"
                        variant={!useExistingLead ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseExistingLead(false)}
                        className="flex items-center gap-2 w-full h-10"
                      >
                        <UserPlus className="h-4 w-4" />
                        לקוח חדש
                      </Button>
                    </div>
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
                      {form.formState.errors.customer?.fullName && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName">שם פרטי</Label>
                      <Input
                        id="firstName"
                        {...form.register("customer.firstName")}
                        className="text-right h-12"
                        placeholder="שם פרטי"
                      />
                      {form.formState.errors.customer?.firstName && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.firstName.message}</p>
                      )}
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
                      {form.formState.errors.customer?.city && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">כתובת</Label>
                      <Input
                        id="address"
                        {...form.register("customer.address")}
                        className="text-right h-12"
                        placeholder="רחוב הרצל 1"
                      />
                      {form.formState.errors.customer?.address && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.address.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Items - Mobile */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="flex items-center gap-2 h-10"
                    >
                      <Plus className="h-4 w-4" />
                      הוסף פריט
                    </Button>
                    <h3 className="text-lg font-semibold">פרטי ההצעה</h3>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4 border-2">
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive h-8"
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <h4 className="font-medium text-right">פריט {index + 1}</h4>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>תיאור הפריט</Label>
                            <Textarea
                              {...form.register(`items.${index}.description`)}
                              className="text-right min-h-[60px] resize-none"
                              placeholder="תיאור הפריט או השירות"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>מחיר יחידה</Label>
                              <Input
                                type="number"
                                {...form.register(`items.${index}.unitPrice`, {
                                  valueAsNumber: true,
                                  onChange: () => calculateTotalPrice(index)
                                })}
                                className="text-right h-12"
                                placeholder="0"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>כמות</Label>
                              <Input
                                type="number"
                                {...form.register(`items.${index}.quantity`, {
                                  valueAsNumber: true,
                                  onChange: () => calculateTotalPrice(index)
                                })}
                                className="text-right h-12"
                                placeholder="1"
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>הנחה</Label>
                              <Input
                                type="number"
                                {...form.register(`items.${index}.discount`, {
                                  valueAsNumber: true,
                                  onChange: () => calculateTotalPrice(index)
                                })}
                                className="text-right h-12"
                                placeholder="0"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>מחיר סופי</Label>
                              <Input
                                type="number"
                                {...form.register(`items.${index}.totalPrice`, {
                                  valueAsNumber: true
                                })}
                                className="text-right h-12 bg-muted"
                                placeholder="0"
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>הערות</Label>
                            <Textarea
                              {...form.register(`items.${index}.notes`)}
                              className="text-right min-h-[60px] resize-none"
                              placeholder="הערות לפריט (אופציונלי)"
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Financial Summary - Mobile */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                    <span>סכום ביניים:</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-destructive">-{formatPrice(totalDiscount)}</span>
                    <span>הנחה כוללת:</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{formatPrice(total)}</span>
                    <span>סה"כ לתשלום:</span>
                  </div>
                </div>

                {/* Additional Fields - Mobile */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terms">תנאים</Label>
                    <Textarea
                      id="terms"
                      {...form.register("terms")}
                      className="text-right min-h-[100px] resize-none"
                      placeholder="תנאי ההצעה"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea
                      id="notes"
                      {...form.register("notes")}
                      className="text-right min-h-[80px] resize-none"
                      placeholder="הערות נוספות (אופציונלי)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Mobile Action Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full h-12 text-lg"
                  >
                    {isCreating ? (
                      <>
                        <Calculator className="mr-2 h-5 w-5 animate-pulse" />
                        שומר הצעת מחיר...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-5 w-5" />
                        שמור הצעת מחיר
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Section - Mobile */}
          {showPreview && savedQuoteData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5" />
                  תצוגה מקדימה - הצעת מחיר
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg text-right">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{savedQuoteData.quoteNumber}</span>
                      <span className="font-semibold">מספר הצעה:</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{savedQuoteData.customer.fullName}</span>
                      <span className="font-semibold">לקוח:</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>{formatPrice(savedQuoteData.financial?.total || 0)}</span>
                      <span>סה"כ:</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Download className="mr-2 h-4 w-4" />
                  הורד PDF
                </Button>
              </CardContent>
            </Card>
          )}
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
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("date", date.toISOString().split('T')[0]);
                            }
                          }}
                          initialFocus
                          dir="rtl"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>תוקף ההצעה</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-right font-normal",
                            !form.watch("validUntil") && "text-muted-foreground"
                          )}
                        >
                          <span>{form.watch("validUntil") ? new Date(form.watch("validUntil")).toLocaleDateString('he-IL') : "בחר תאריך תוקף"}</span>
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={selectedValidUntil}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("validUntil", date.toISOString().split('T')[0]);
                            }
                          }}
                          initialFocus
                          dir="rtl"
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
                      <Label htmlFor="firstName">שם פרטי</Label>
                      <Input
                        id="firstName"
                        {...form.register("customer.firstName")}
                        className="text-right"
                        placeholder="שם פרטי"
                      />
                      {form.formState.errors.customer?.firstName && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.firstName.message}</p>
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      הוסף פריט
                    </Button>
                    <h3 className="text-lg font-semibold">פרטי ההצעה</h3>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive"
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <h4 className="font-medium">פריט {index + 1}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                          <div className="space-y-2 lg:col-span-2">
                            <Label>תיאור הפריט</Label>
                            <Input
                              {...form.register(`items.${index}.description`)}
                              className="text-right"
                              placeholder="תיאור הפריט או השירות"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>מחיר יחידה</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.unitPrice`, {
                                valueAsNumber: true,
                                onChange: () => calculateTotalPrice(index)
                              })}
                              className="text-right"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>כמות</Label>
                            <Input
                              type="number"
                              min="1"
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                                onChange: () => calculateTotalPrice(index)
                              })}
                              className="text-right"
                              placeholder="1"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>הנחה</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.discount`, {
                                valueAsNumber: true,
                                onChange: () => calculateTotalPrice(index)
                              })}
                              className="text-right"
                              placeholder="0"
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

          {!showPreview && (
            <div className="text-center">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center gap-2"
                size="lg"
              >
                <Download className="h-5 w-5" />
                הורד PDF
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
    </div>
  );
}