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
import { Plus, Trash2, FileText, Download, UserPlus, Calendar as CalendarIcon, Send } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { NewCarOrderData } from "@/types/document-production";
import { useToast } from "@/hooks/use-toast";
import { LeadSearchSelect } from "@/components/leads/LeadSearchSelect";
import { useLeads } from "@/hooks/use-leads";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileDocumentHeader } from "@/components/mobile/MobileDocumentHeader";

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
  const [useExistingLead, setUseExistingLead] = useState(true);
  const [includeVAT, setIncludeVAT] = useState(false);
  const { leads } = useLeads();
  const isMobile = useIsMobile();

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

  const selectedLead = leads?.find(l => l.id === (form.watch("leadId") || ""));

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const selectedDate = form.watch("date") ? new Date(form.watch("date")) : undefined;
  
  // Calculate totals
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

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = leads?.find(lead => lead.id === leadId);
    if (selectedLead) {
      form.setValue("leadId", leadId);
      form.setValue("customer.fullName", selectedLead.name || "");
      form.setValue("customer.firstName", selectedLead.name?.split(" ")[0] || "");
      form.setValue("customer.city", "");
      form.setValue("customer.address", "");
      form.setValue("customer.birthYear", "");
      form.setValue("customer.idNumber", "");
    }
  };

  const onSubmit = (data: NewCarOrderFormValues) => {
    toast({
      title: "הצלחה",
      description: "הזמנת הרכב החדש נשמרה בהצלחה",
    });
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    toast({
      title: "בפיתוח",  
      description: "הורדת PDF תהיה זמינה בקרוב",
    });
  };

  if (isMobile) {
    return (
      <MobileContainer withBottomNav={true}>
        <MobileDocumentHeader 
          title="הזמנת רכב חדש"
          icon={<FileText className="h-5 w-5" />}
        />
        
        <div className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right text-lg">תאריך ההזמנה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">תאריך</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-right font-normal h-12",
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
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right text-lg">פרטי הלקוח</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={useExistingLead ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseExistingLead(true)}
                    className="flex-1 h-12"
                  >
                    בחר לקוח קיים
                  </Button>
                  <Button
                    type="button"
                    variant={!useExistingLead ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setUseExistingLead(false);
                      // Clear leadId when switching to new customer
                      form.setValue("leadId", undefined);
                    }}
                    className="flex-1 h-12 flex items-center gap-2"
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
                    <Label htmlFor="birthYear">שנת לידה</Label>
                    <Input
                      id="birthYear"
                      {...form.register("customer.birthYear")}
                      className="text-right h-12"
                      placeholder="1990"
                    />
                    {form.formState.errors.customer?.birthYear && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.birthYear.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">תעודת זהות</Label>
                    <Input
                      id="idNumber"
                      {...form.register("customer.idNumber")}
                      className="text-right h-12"
                      placeholder="123456789"
                    />
                    {form.formState.errors.customer?.idNumber && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.idNumber.message}</p>
                    )}
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
                      placeholder="הכנס כתובת"
                    />
                    {form.formState.errors.customer?.address && (
                      <p className="text-sm text-destructive">{form.formState.errors.customer.address.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right text-lg">פרטי ההזמנה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={addItem}
                  className="w-full h-12 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  הוסף פריט
                </Button>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 border-2 border-dashed">
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive h-10"
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <h4 className="font-medium">פריט {index + 1}</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>תיאור</Label>
                          <Input
                            {...form.register(`items.${index}.description`)}
                            className="text-right h-12"
                            placeholder="תיאור הפריט"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>מחיר נטו</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.netPrice`, {
                                valueAsNumber: true,
                                onChange: () => calculateFinalPrice(index)
                              })}
                              className="text-right h-12"
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
                                onChange: () => calculateFinalPrice(index)
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
                            {...form.register(`items.${index}.discount`, {
                              valueAsNumber: true,
                              onChange: () => calculateFinalPrice(index)
                            })}
                            className="text-right h-12"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-semibold text-right">
                            מחיר סופי: {formatPrice(watchedItems[index]?.finalPrice || 0)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    {...form.register("notes")}
                    className="text-right min-h-[100px]"
                    placeholder="הערות נוספות להזמנה..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm">כולל מע"מ (18%)</span>
                  <Switch checked={includeVAT} onCheckedChange={setIncludeVAT} />
                </div>
                <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                    <span>סה"כ לפני הנחה:</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="font-semibold">-{formatPrice(totalDiscount)}</span>
                    <span>הנחה:</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{formatPrice(total)}</span>
                    <span>סה"כ:</span>
                  </div>
                  {includeVAT && (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{formatPrice(vatAmount)}</span>
                      <span>מע"מ (18%):</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{formatPrice(grandTotal)}</span>
                    <span>סה"כ לתשלום:</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full h-12">
              <FileText className="mr-2 h-5 w-5" />
              שמור הזמנה
            </Button>
          </form>

          {/* Preview Section */}
          {showPreview && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-right">תצוגה מקדימה - הזמנת רכב חדש</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-right space-y-2">
                  <p><strong>תאריך:</strong> {form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('he-IL') : ""}</p>
                  <p><strong>לקוח:</strong> {form.watch("customer.fullName")}</p>
                  <p><strong>סה"כ לתשלום:</strong> {formatPrice(grandTotal)}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadPDF} className="flex-1 h-12">
                    <Download className="mr-2 h-4 w-4" />
                    הורד PDF
                  </Button>
                  <Button variant="outline" className="flex-1 h-12">
                    <Send className="mr-2 h-4 w-4" />
                    שלח בוואטסאפ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-none">
        {/* Form Section */}
        <div className="space-y-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <FileText className="h-6 w-6" />
                הזמנת רכב חדש
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.date && (
                    <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                  )}
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
                        onClick={() => {
                          setUseExistingLead(false);
                          // Clear leadId when switching to new customer
                          form.setValue("leadId", undefined);
                        }}
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
                      <Label htmlFor="birthYear">שנת לידה</Label>
                      <Input
                        id="birthYear"
                        {...form.register("customer.birthYear")}
                        className="text-right"
                        placeholder="1990"
                      />
                      {form.formState.errors.customer?.birthYear && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.birthYear.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">תעודת זהות</Label>
                      <Input
                        id="idNumber"
                        {...form.register("customer.idNumber")}
                        className="text-right"
                        placeholder="123456789"
                      />
                      {form.formState.errors.customer?.idNumber && (
                        <p className="text-sm text-destructive">{form.formState.errors.customer.idNumber.message}</p>
                      )}
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
                        placeholder="הכנס כתובת"
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
                    <h3 className="text-lg font-semibold">פרטי ההזמנה</h3>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="space-y-2 lg:col-span-2">
                            <Label>תיאור</Label>
                            <Input
                              {...form.register(`items.${index}.description`)}
                              className="text-right"
                              placeholder="תיאור הפריט"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>מחיר נטו</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.netPrice`, {
                                valueAsNumber: true,
                                onChange: () => calculateFinalPrice(index)
                              })}
                              className="text-right"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>הנחה</Label>
                            <Input
                              type="number"
                              {...form.register(`items.${index}.discount`, {
                                valueAsNumber: true,
                                onChange: () => calculateFinalPrice(index)
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
                                onChange: () => calculateFinalPrice(index)
                              })}
                              className="text-right"
                              placeholder="1"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-semibold text-right">
                            מחיר סופי: {formatPrice(watchedItems[index]?.finalPrice || 0)}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות</Label>
                    <Textarea
                      id="notes"
                      {...form.register("notes")}
                      className="text-right min-h-[100px]"
                      placeholder="הערות נוספות להזמנה..."
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm">כולל מע"מ (18%)</span>
                      <Switch checked={includeVAT} onCheckedChange={setIncludeVAT} />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                        <span>סה"כ לפני הנחה:</span>
                      </div>
                      <div className="flex justify-between items-center text-red-600">
                        <span className="font-semibold">-{formatPrice(totalDiscount)}</span>
                        <span>הנחה:</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{formatPrice(total)}</span>
                        <span>סה"כ:</span>
                      </div>
                      {includeVAT && (
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{formatPrice(vatAmount)}</span>
                          <span>מע"מ (18%):</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>{formatPrice(grandTotal)}</span>
                        <span>סה"כ לתשלום:</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" size="lg" className="flex-1">
                    <FileText className="mr-2 h-5 w-5" />
                    שמור הזמנה
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right">תצוגה מקדימה - הזמנת רכב חדש</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-right space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">פרטי הזמנה</h4>
                      <p><strong>תאריך:</strong> {form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('he-IL') : ""}</p>
                      <p><strong>לקוח:</strong> {form.watch("customer.fullName")}</p>
                      <p><strong>סה"כ לתשלום:</strong> {formatPrice(grandTotal)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">פרטי לקוח</h4>
                      <p><strong>שם:</strong> {form.watch("customer.fullName")}</p>
                      <p><strong>עיר:</strong> {form.watch("customer.city")}</p>
                      <p><strong>כתובת:</strong> {form.watch("customer.address")}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">פריטים</h4>
                    {form.watch("items").map((item, index) => (
                      <div key={index} className="border rounded p-3 mb-2">
                        <p><strong>תיאור:</strong> {item.description}</p>
                        <p><strong>מחיר:</strong> {formatPrice(item.finalPrice)}</p>
                      </div>
                    ))}
                  </div>
                  
                  {form.watch("notes") && (
                    <div>
                      <h4 className="font-semibold mb-2">הערות</h4>
                      <p>{form.watch("notes")}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleDownloadPDF} className="flex-1" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    הורד PDF
                  </Button>
                  <Button variant="outline" className="flex-1" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    שלח בוואטסאפ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}