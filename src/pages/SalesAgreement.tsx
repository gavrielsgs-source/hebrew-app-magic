import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, Download, Send, Loader2, User, Car, DollarSign, Eye, Save, CheckCircle, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileDocumentHeader } from "@/components/mobile/MobileDocumentHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarSearchSelect } from "@/components/cars/CarSearchSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useProfile } from "@/hooks/use-profile";
import { generateSalesAgreementPDF } from "@/utils/pdf-generator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SalesAgreementPreview } from "@/components/sales-agreement/SalesAgreementPreview";
import { useCustomers, useCreateCustomerDocument } from "@/hooks/customers";
import { Search } from "lucide-react";

const salesAgreementSchema = z.object({
  date: z.date({
    required_error: "תאריך נדרש"
  }),
  leadId: z.string({
    required_error: "בחירת לקוח נדרשת"
  }),
  carId: z.string().optional(),
  buyerId: z.string({
    required_error: "תעודת זהות קונה נדרשת"
  }),
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
  const { leads = [] } = useLeads();
  const { cars = [] } = useCars();
  const { profile } = useProfile();
  const { data: customers = [] } = useCustomers();
  const createCustomerDocument = useCreateCustomerDocument();
  const isMobile = useIsMobile();

  const form = useForm<SalesAgreementFormData>({
    resolver: zodResolver(salesAgreementSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const selectedLeadId = form.watch("leadId");
  const selectedCarId = form.watch("carId");
  
  const selectedLead = leads.find(lead => lead.id === selectedLeadId);
  const selectedCar = cars.find(car => car.id === selectedCarId);

  // Create preview data
  const previewData = {
    date: form.watch("date"),
    seller: {
      company: profile?.company_name || profile?.full_name || "חברת רכב בע\"מ",
      id: "000000000", // TODO: Add business_id to profile
      phone: profile?.phone || "052-0000000",
      address: {
        street: "רחוב ראשי 1", // TODO: Add address to profile
        city: "תל אביב", // TODO: Add city to profile
        country: "ישראל"
      }
    },
    buyer: selectedLead ? {
      name: selectedLead.name,
      id: form.watch("buyerId"),
      phone: selectedLead.phone || "",
      address: form.watch("buyerAddress")
    } : undefined,
    car: selectedCar ? {
      make: selectedCar.make,
      model: selectedCar.model,
      licenseNumber: selectedCar.license_number || "",
      chassisNumber: selectedCar.chassis_number || "",
      year: selectedCar.year,
      mileage: selectedCar.kilometers,
      hand: "1", // TODO: Add hand field to car model
      originality: "מקורית"
    } : undefined,
    financial: {
      totalPrice: form.watch("totalPrice") ? parseFloat(form.watch("totalPrice")) : undefined,
      downPayment: form.watch("downPayment") ? parseFloat(form.watch("downPayment")) : undefined,
      remainingAmount: form.watch("remainingAmount") ? parseFloat(form.watch("remainingAmount")) : 
        (form.watch("totalPrice") && form.watch("downPayment")) ? 
        parseFloat(form.watch("totalPrice")) - parseFloat(form.watch("downPayment")) : undefined,
      paymentTerms: form.watch("paymentTerms"),
      specialTerms: form.watch("specialTerms")
    }
  };

  const onSubmit = async (data: SalesAgreementFormData) => {
    try {
      setIsGenerating(true);
      
      if (!selectedLead) {
        toast({
          title: "שגיאה",
          description: "לא נמצא לקוח מתאים",
          variant: "destructive"
        });
        return;
      }

      const agreementData = {
        date: format(data.date, "dd MMMM yyyy", { locale: he }),
        seller: {
          company: profile?.company_name || profile?.full_name || "חברת רכב בע\"מ",
          id: "000000000", // This should be configured in profile
          phone: profile?.phone || "052-0000000",
          address: {
            street: "רחוב ראשי 1", // This should be configured in profile
            city: "תל אביב", // This should be configured in profile
            country: "ישראל"
          }
        },
        buyer: {
          name: selectedLead.name,
          id: data.buyerId,
          phone: selectedLead.phone || "",
          address: data.buyerAddress
        },
        car: selectedCar ? {
          make: selectedCar.make,
          model: selectedCar.model,
          licenseNumber: selectedCar.license_number || "",
          chassisNumber: selectedCar.chassis_number || "",
          year: selectedCar.year,
          mileage: selectedCar.kilometers,
          hand: "1", // This should be calculated or stored
          originality: "מקורית"
        } : undefined,
        financial: {
          totalPrice: parseFloat(data.totalPrice),
          downPayment: parseFloat(data.downPayment),
          remainingAmount: data.remainingAmount ? parseFloat(data.remainingAmount) : parseFloat(data.totalPrice) - parseFloat(data.downPayment),
          paymentTerms: data.paymentTerms || "",
          specialTerms: data.specialTerms || ""
        }
      };

      await generateSalesAgreementPDF(agreementData);

      // Attach the agreement to an existing customer by phone or name when possible
      const normalizePhone = (p?: string) => (p || '').replace(/[^\d]/g, '');
      const matchedCustomer = customers.find(c => normalizePhone(c.phone) && normalizePhone(selectedLead.phone || '') && normalizePhone(c.phone) === normalizePhone(selectedLead.phone || ''))
        || customers.find(c => c.full_name === selectedLead.name);
      if (matchedCustomer) {
        createCustomerDocument.mutate({
          customerId: matchedCustomer.id,
          title: 'הסכם מכר',
          type: 'contract',
          amount: parseFloat(data.totalPrice),
          date: format(data.date, 'yyyy-MM-dd')
        });
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

  if (isMobile) {
    return (
      <MobileContainer withPadding={false} withBottomNav={true}>
        <MobileDocumentHeader 
          title="הסכם מכר" 
          icon={<Calendar className="h-5 w-5" />}
        />
        <div className="p-4 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-right flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                הסכם מכר - הפקה אוטומטית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Mobile optimized form fields */}
                  <div className="space-y-4">
                    {/* Date Selection - Mobile */}
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
                                    "w-full h-12 pl-3 text-right font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: he })
                                  ) : (
                                    <span>בחר תאריך</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Lead Selection - Mobile */}
                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">בחירת לקוח</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger dir="rtl" className="text-right h-12">
                                <SelectValue placeholder="חפש או בחר לקוח" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent align="end" dir="rtl" className="z-50 bg-popover text-right">
                              {leads.map((lead) => (
                                <SelectItem key={lead.id} value={lead.id} className="text-right">
                                  <div className="flex flex-col text-right w-full">
                                    <span className="font-medium">{lead.name}</span>
                                    {lead.phone && (
                                      <span className="text-xs text-muted-foreground">{lead.phone}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Car Selection - Mobile */}
                    <FormField
                      control={form.control}
                      name="carId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">שיוך רכב (אופציונלי)</FormLabel>
                          <CarSearchSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="בחר רכב"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Total Price - Mobile */}
                    <FormField
                      control={form.control}
                      name="totalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">מחיר כולל (₪)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס מחיר כולל" className="text-right h-12 text-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Down Payment - Mobile */}
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">מקדמה (₪)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס סכום מקדמה" className="text-right h-12 text-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Buyer ID - Mobile */}
                    <FormField
                      control={form.control}
                      name="buyerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">תעודת זהות קונה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס תעודת זהות" className="text-right h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Buyer Address - Mobile */}
                    <FormField
                      control={form.control}
                      name="buyerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">כתובת קונה</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="הכנס כתובת מלאה" className="text-right h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remaining Amount - Mobile */}
                    <FormField
                      control={form.control}
                      name="remainingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right">יתרת תשלום (₪)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="יחושב אוטומטית אם לא יוזן" className="text-right h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Terms - Mobile */}
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
                              className="text-right min-h-[80px] resize-none"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Special Terms - Mobile */}
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
                              className="text-right min-h-[100px] resize-none"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="pt-4 space-y-3 border-t">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full h-12 text-lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          יוצר הסכם...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          צור הסכם מכר
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview Section - Mobile (shown below form) */}
          {(previewData.buyer || previewData.car) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5" />
                  תצוגה מקדימה
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesAgreementPreview data={previewData} />
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              הסכם מכר - הפקה אוטומטית
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                "w-full pl-3 text-right font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: he })
                              ) : (
                                <span>בחר תאריך</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lead Selection */}
                <FormField
                  control={form.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">בחירת לקוח</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger dir="rtl" className="text-right">
                            <SelectValue placeholder="חפש או בחר לקוח" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent align="end" dir="rtl" className="z-50 bg-popover text-right w-[var(--radix-select-trigger-width)] min-w-[300px]">
                          <div className="sticky top-0 bg-background border-b p-2 z-50">
                            <div className="relative">
                              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="חפש לקוח לפי שם או טלפון..."
                                className="pr-8 text-right"
                                dir="rtl"
                              />
                            </div>
                          </div>
                          {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id} className="text-right">
                              <div className="flex flex-col text-right w-full">
                                <span className="font-medium">{lead.name}</span>
                                {lead.phone && (
                                  <span className="text-xs text-muted-foreground">{lead.phone}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Car Selection (Optional) */}
                <FormField
                  control={form.control}
                  name="carId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">שיוך רכב (אופציונלי)</FormLabel>
                      <CarSearchSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="בחר רכב"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Price */}
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">מחיר כולל (₪)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="הכנס מחיר כולל" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Down Payment */}
                <FormField
                  control={form.control}
                  name="downPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">מקדמה (₪)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="הכנס סכום מקדמה" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buyer ID */}
                <FormField
                  control={form.control}
                  name="buyerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">תעודת זהות קונה</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="הכנס תעודת זהות" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buyer Address */}
                <FormField
                  control={form.control}
                  name="buyerAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">כתובת קונה</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="הכנס כתובת מלאה" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remaining Amount */}
                <FormField
                  control={form.control}
                  name="remainingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-right">יתרת תשלום (₪)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="יחושב אוטומטית אם לא יוזן" className="text-right" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Terms */}
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
                          className="text-right"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Special Terms */}
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
                        className="text-right"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Car Details Preview */}
              {selectedCar && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-right text-lg">פרטי הרכב הנבחר</CardTitle>
                  </CardHeader>
                  <CardContent className="text-right space-y-2">
                    <p><strong>יצרן ודגם:</strong> {selectedCar.make} {selectedCar.model}</p>
                    <p><strong>שנת ייצור:</strong> {selectedCar.year}</p>
                    <p><strong>קילומטרים:</strong> {selectedCar.kilometers?.toLocaleString()}</p>
                    {selectedCar.license_number && (
                      <p><strong>מספר רישוי:</strong> {selectedCar.license_number}</p>
                    )}
                    {selectedCar.chassis_number && (
                      <p><strong>מספר שילדה:</strong> {selectedCar.chassis_number}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isGenerating ? "יוצר הסכם..." : "יצירת PDF"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  disabled={!selectedLead?.phone}
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (selectedLead?.phone) {
                      const message = `שלום ${selectedLead.name}, מצורף הסכם המכר עבור הרכב. נשמח לקבוע פגישה לחתימה על ההסכם.`;
                      const whatsappUrl = `https://wa.me/${selectedLead.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                  שליחה לווטסאפ
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Preview Section */}
      <div className="xl:sticky xl:top-6">
        <SalesAgreementPreview data={previewData} />
      </div>
    </div>
    </div>
  );
}