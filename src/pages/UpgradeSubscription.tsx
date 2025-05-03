
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";

const paymentFormSchema = z.object({
  fullName: z.string()
    .min(3, "יש להזין שם מלא")
    .refine(val => val.includes(' '), {
      message: "יש להזין שם פרטי ושם משפחה",
    }),
  phone: z.string()
    .min(10, "מספר טלפון חייב להכיל 10 ספרות")
    .max(10, "מספר טלפון חייב להכיל 10 ספרות")
    .regex(/^05\d{8}$/, "מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות"),
  email: z.string().email("נא להזין כתובת אימייל תקינה").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function UpgradeSubscription() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      notes: "",
    },
  });
  
  const plans = [
    {
      id: "premium",
      name: "פרימיום",
      description: "מתאים לסוחרים קטנים (1-2 אנשי צוות)",
      price: "199 ₪",
      priceValue: 199,
      features: [
        "ניהול עד 20 רכבים במלאי",
        "ניהול עד 50 לקוחות",
        "3 תבניות מובנות לוואטסאפ",
        "שליחת הודעות אישיות ללקוחות",
        "דשבורד בסיסי"
      ],
      tier: "premium"
    },
    {
      id: "business",
      name: "ביזנס",
      description: "מתאים לסוכנויות בינוניות (3-7 אנשי צוות)",
      price: "349 ₪",
      priceValue: 349,
      features: [
        "ניהול עד 50 רכבים במלאי",
        "ניהול עד 200 לקוחות",
        "תגיות מתקדמות ללקוחות",
        "שליחה לקבוצות לקוחות לפי תגיות",
        "5 משתמשים במערכת",
        "דוחות ביצועים בסיסיים"
      ],
      tier: "business"
    },
    {
      id: "enterprise",
      name: "אנטרפרייז",
      description: "מתאים למגרשים גדולים ורשתות סוכנויות",
      price: "599 ₪",
      priceValue: 599,
      features: [
        "רכבים ולקוחות ללא הגבלה",
        "10 משתמשים במערכת",
        "תבניות הודעה מותאמות אישית",
        "אוטומציה של תזכורות ומעקב",
        "ד��חות מתקדמים וניתוח ביצועים",
        "ייצוא נתונים"
      ],
      tier: "enterprise"
    }
  ];

  const onSubmit = async (data: PaymentFormValues) => {
    if (!selectedPlan) {
      toast.error("אנא בחר חבילה תחילה");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Start upgrade planing!");
      const selectedPlanObj = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanObj) {
        throw new Error("חבילה לא נמצאה");
      }

      // הגדרת URLs מלאים עם origin מדויק
      const origin = window.location.origin;
      console.log(`Origin URL: ${origin}`);

      const successUrl = `${origin}/subscription/payment-success?plan=${selectedPlan}`;
      const errorUrl = `${origin}/subscription/payment-error`;
      
      console.log(`Success URL: ${successUrl}`);
      console.log(`Error URL: ${errorUrl}`);

      // הכנת פרמטרים לתשלום - הוספת maxPayments לטיפול בשגיאת קוד 705
      const paymentPayload = {
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email || undefined,
        amount: selectedPlanObj.priceValue,
        description: `מנוי ${selectedPlanObj.name} - חיוב חודשי`,
        successUrl: successUrl,
        errorUrl: errorUrl,
        maxPayments: 1, // הוספת מספר תשלומים מקסימלי כברירת מחדל
        // maxPayments: "1", // הוספת מספר תשלומים מקסימלי כברירת מחדל
        language: "HE",
      };

      console.log("Sending payment payload:", paymentPayload);

      // שליחת הבקשה ליצירת תשלום
      const { data: paymentData, error } = await supabase.functions.invoke('grow-payment', {
        body: {
          action: 'createPaymentProcess',
          payload: paymentPayload
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      console.log("Payment response:", paymentData);

      // בדיקת שגיאות בתשובה
      if (paymentData.error) {
        console.error("Payment API error:", paymentData);
        // Improved error message handling
        const errorMessage = typeof paymentData.error === 'string' 
          ? paymentData.error 
          : (paymentData.details?.message || 'שגיאה לא ידועה');
        throw new Error(errorMessage);
      }

      // טיפול בתשובה מוצלחת
      if (paymentData.success) {
        // אם התקבל URL להפניה, מפנים את המשתמש ישירות
        if (paymentData.url || paymentData.redirectUrl) {
          const redirectUrl = paymentData.url || paymentData.redirectUrl;
          console.log("Redirecting to payment URL:", redirectUrl);
          // הפניה ישירה לדף התשלום
          window.location.href = redirectUrl;
        } else {
          console.error("Missing redirect URL in response:", paymentData);
          throw new Error('לא התקבלה כתובת הפניה לתשלום');
        }
      } else {
        throw new Error('לא התקבלה תשובה תקינה משרת התשלומים');
      }
      
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("שגיאה בתהליך התשלום", {
        description: error instanceof Error ? error.message : String(error)
      });
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setPaymentDrawerOpen(true);
  };

  const handleMockSuccess = (planId: string) => {
    setLoading(true);
    setTimeout(() => {
      toast.success(`שדרוג לחבילת ${planId} בוצע בהצלחה!`, {
        description: "המערכת תתעדכן בקרוב עם הפרמטרים החדשים."
      });
      setLoading(false);
      refreshSubscription();
      navigate("/subscription");
    }, 1500);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">שדרוג מנוי</h1>
          <p className="text-muted-foreground mt-2">בחר את החבילה המתאימה לצרכים שלך</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscription")}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה לניהול מנוי
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={selectedPlan === plan.id ? "border-primary border-2 shadow-lg" : "hover:shadow-md transition-shadow"}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground"> / חודש</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {subscription.tier === plan.tier ? (
                <div className="py-2 px-4 bg-muted/50 rounded text-center text-sm font-medium">
                  החבילה הנוכחית שלך
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={subscription.tier === plan.tier || loading}
                onClick={() => handleUpgrade(plan.id)}
              >
                {loading && selectedPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    מעבד...
                  </span>
                ) : subscription.tier === plan.tier ? (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    החבילה הנוכחית
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 mr-2" />
                    שדרג עכשיו
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 bg-muted/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">מידע נוסף על התשלום</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <span>התשלום חודשי, ניתן לבטל בכל עת</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <span>תמיכה טכנית זמינה 24/7 לכל סוגי המנויים</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <span>נתונים מוצפנים ומאובטחים בתקן בינלאומי</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-1" />
            <span>החזר כספי מלא ב-14 הימים הראשונים, ללא שאלות</span>
          </li>
        </ul>
      </div>

      <Drawer open={paymentDrawerOpen} onOpenChange={setPaymentDrawerOpen}>
        <DrawerContent className="max-h-[96%]">
          <DrawerHeader>
            <DrawerTitle className="text-center text-lg">
              {selectedPlan && (
                <>פרטי תשלום - מנוי {plans.find(p => p.id === selectedPlan)?.name}</>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם מלא</FormLabel>
                      <FormControl>
                        <Input placeholder="ישראל ישראלי" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>טלפון נייד</FormLabel>
                      <FormControl>
                        <Input placeholder="0501234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>אימייל (אופציונלי)</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
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
                      <FormLabel>הערות (אופציונלי)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="הערות נוספות לתשלום" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setPaymentDrawerOpen(false)}
                    disabled={loading}
                  >
                    ביטול
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        מעבד...
                      </span>
                    ) : (
                      <>המשך לתשלום</>
                    )}
                  </Button>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-2">למטרות פיתוח בלבד:</p>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setPaymentDrawerOpen(false);
                      handleMockSuccess(selectedPlan || 'premium');
                    }}
                  >
                    סימולציית תשלום מוצלח
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          <DrawerFooter className="pt-2">
            <p className="text-sm text-center text-muted-foreground">
              התשלום מאובטח ומוצפן בתקן PCI DSS
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
