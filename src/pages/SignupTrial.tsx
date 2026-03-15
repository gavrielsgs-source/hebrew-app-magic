import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import { TranzilaPaymentIframe } from "@/components/subscription/TranzilaPaymentIframe";
import { validateDiscountCode, applyDiscount, addVat, getVatAmount } from "@/utils/discount-codes";

const signupSchema = z.object({
  fullName: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string().min(10, "מספר טלפון חייב להכיל לפחות 10 ספרות"),
  plan: z.enum(["premium", "business", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const plans = [
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: ["עד 20 רכבים", "עד 50 לידים", "עד 2 משתמשים", "אנליטיקס בסיסי"],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: ["עד 50 רכבים", "עד 200 לידים", "עד 5 משתמשים", "אנליטיקס מלא"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    features: ["רכבים ללא הגבלה", "לידים ללא הגבלה", "עד 10 משתמשים", "אנליטיקס מותאם"],
  },
];

export default function SignupTrial() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [discountStatus, setDiscountStatus] = useState<{ valid: boolean; message: string; percent: number } | null>(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [tranzilaData, setTranzilaData] = useState<{
    thtk: string;
    supplier: string;
    finalSum: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      plan: "business",
      billingCycle: "monthly",
    },
  });

  const selectedPlan = form.watch("plan");
  const billingCycle = form.watch("billingCycle");

  const getPlanPrice = (planId: string, cycle: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return 0;
    return cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const handleApplyDiscount = () => {
    if (!discountCodeInput.trim()) return;
    const result = validateDiscountCode(discountCodeInput, billingCycle, selectedPlan);
    if (result.valid) {
      setDiscountStatus({ valid: true, message: `הנחה של ${result.discountPercent}% הוחלה בהצלחה!`, percent: result.discountPercent });
      setAppliedDiscountCode(discountCodeInput.trim().toUpperCase());
    } else {
      setDiscountStatus({ valid: false, message: result.errorMessage || 'קוד לא תקין', percent: 0 });
      setAppliedDiscountCode("");
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCodeInput("");
    setDiscountStatus(null);
    setAppliedDiscountCode("");
  };

  // Get base sum before VAT - discount replaces yearly discount
  const getBaseSumBeforeVat = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return 0;

    if (discountStatus?.valid && discountStatus.percent > 0 && billingCycle === 'yearly') {
      // Discount replaces yearly discount: use monthlyPrice × 12 as base
      return applyDiscount(plan.monthlyPrice * 12, discountStatus.percent);
    }

    return getPlanPrice(selectedPlan, billingCycle);
  };

  const getDisplayPrice = () => {
    return getBaseSumBeforeVat();
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      let actualSum = getPlanPrice(data.plan, data.billingCycle);

      if (discountStatus?.valid && discountStatus.percent > 0) {
        actualSum = applyDiscount(actualSum, discountStatus.percent);
      }

      const { data: handshakeData, error: handshakeError } = await supabase.functions.invoke(
        "tranzila-handshake",
        {
          body: {
            sum: actualSum,
            planId: data.plan,
            billingCycle: data.billingCycle,
            isYearly: data.billingCycle === 'yearly',
            discountCode: appliedDiscountCode || undefined,
          },
        }
      );

      if (handshakeError) {
        console.error("Handshake error:", handshakeError);
        throw new Error(handshakeError.message || "שגיאה באתחול תשלום");
      }

      if (!handshakeData?.success || !handshakeData?.thtk) {
        throw new Error(handshakeData?.error || "שגיאה באתחול תשלום");
      }

      setTranzilaData({
        thtk: handshakeData.thtk,
        supplier: handshakeData.supplier,
        finalSum: actualSum,
      });

    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "אירעה שגיאה בתהליך ההרשמה");
    } finally {
      setIsLoading(false);
    }
  };

  const formValues = form.watch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            התחל ניסיון חינם ל-14 ימים
          </h1>
          <p className="text-xl text-muted-foreground">
            ללא חיוב עד תום תקופת הניסיון • ביטול בכל עת
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 mb-12 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>ללא התחייבות</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>גישה מלאה לכל התכונות</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>תמיכה מלאה 24/7</span>
          </div>
        </div>

        {tranzilaData ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">השלם תשלום</CardTitle>
                <CardDescription className="text-center">
                  מנוי {plans.find(p => p.id === selectedPlan)?.name} - {billingCycle === 'yearly' ? 'שנתי' : 'חודשי'}
                  {discountStatus?.valid && (
                    <>
                      {' '} | <span className="line-through">₪{getPlanPrice(selectedPlan, billingCycle)}</span>{' '}
                      <span className="text-green-600 font-bold">₪{tranzilaData.finalSum}</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TranzilaPaymentIframe
                  supplier={tranzilaData.supplier}
                  thtk={tranzilaData.thtk}
                  sum={tranzilaData.finalSum}
                  recurSum={tranzilaData.finalSum}
                  recurTransaction={billingCycle === 'yearly' ? '7_approved' : '4_approved'}
                  customerInfo={{
                    contact: formValues.fullName,
                    email: formValues.email,
                    phone: formValues.phone,
                  }}
                  planId={selectedPlan}
                  billingCycle={billingCycle}
                  userId={userId}
                  isNewUser={true}
                  productName={`מנוי ${plans.find(p => p.id === selectedPlan)?.name} - CarsLead`}
                />
                <div className="mt-4 text-center">
                  <Button variant="ghost" onClick={() => setTranzilaData(null)}>
                    חזרה לבחירת חבילה
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Plans Selection */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>בחר את החבילה המתאימה לך</CardTitle>
                  <CardDescription>
                    כל החבילות כוללות 14 ימי ניסיון חינם
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="billingCycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>מחזור תשלום</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) => {
                                field.onChange(val);
                                // Reset discount when switching billing cycle
                                if (discountStatus) {
                                  handleRemoveDiscount();
                                }
                              }}
                              value={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" />
                                <label htmlFor="monthly" className="cursor-pointer">חודשי</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yearly" id="yearly" />
                                <label htmlFor="yearly" className="cursor-pointer">
                                  שנתי (חסוך 17%)
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-3"
                            >
                              {plans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                                    field.value === plan.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  } ${plan.popular ? "ring-2 ring-primary" : ""}`}
                                >
                                  {plan.popular && (
                                    <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                                      הכי פופולרי
                                    </div>
                                  )}
                                  <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                                  <label htmlFor={plan.id} className="cursor-pointer block">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h3 className="font-bold text-lg">{plan.name}</h3>
                                        <div className="text-2xl font-bold mt-1">
                                          ₪{billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
                                          <span className="text-sm text-muted-foreground font-normal">
                                            /{billingCycle === "yearly" ? "שנה" : "חודש"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <ul className="space-y-1 mt-3">
                                      {plan.features.map((feature, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Signup Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>פרטיך האישיים</CardTitle>
                  <CardDescription>
                    מלא את הפרטים כדי להתחיל את תקופת הניסיון
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם מלא</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="שם פרטי ושם משפחה" />
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
                            <FormLabel>אימייל</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="example@email.com" dir="ltr" />
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
                            <FormLabel>טלפון</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" placeholder="050-1234567" dir="ltr" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Discount Code */}
                      <div className="space-y-2">
                        <FormLabel>קוד הנחה (אופציונלי)</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="הכנס קוד הנחה"
                            value={discountCodeInput}
                            onChange={(e) => setDiscountCodeInput(e.target.value)}
                            disabled={discountStatus?.valid}
                            dir="ltr"
                            className="flex-1"
                          />
                          {discountStatus?.valid ? (
                            <Button type="button" variant="outline" onClick={handleRemoveDiscount} className="shrink-0">
                              הסר
                            </Button>
                          ) : (
                            <Button type="button" variant="secondary" onClick={handleApplyDiscount} disabled={!discountCodeInput.trim()} className="shrink-0">
                              החל
                            </Button>
                          )}
                        </div>
                        {discountStatus && (
                          <div className={`flex items-center gap-2 text-sm ${discountStatus.valid ? 'text-green-600' : 'text-destructive'}`}>
                            {discountStatus.valid ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>{discountStatus.message}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-medium mb-2">סיכום:</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>חבילה נבחרת:</span>
                              <span className="font-medium">
                                {plans.find((p) => p.id === selectedPlan)?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>תשלום עתידי:</span>
                              <span className="font-medium">
                                {discountStatus?.valid ? (
                                  <>
                                    <span className="line-through text-muted-foreground">
                                      ₪{getPlanPrice(selectedPlan, billingCycle)}
                                    </span>{' '}
                                    <span className="text-green-600">
                                      ₪{getDisplayPrice()}/{billingCycle === "yearly" ? "שנה" : "חודש"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    ₪{getPlanPrice(selectedPlan, billingCycle)}/
                                    {billingCycle === "yearly" ? "שנה" : "חודש"}
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                              <span>היום:</span>
                              <span>₪0 - ניסיון חינם!</span>
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                              מעבד...
                            </>
                          ) : (
                            <>
                              התחל ניסיון חינם
                              <ArrowRight className="mr-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          בלחיצה על הכפתור, אתה מסכים{" "}
                          <a href="/terms" className="underline">לתנאי השימוש</a> ו
                          <a href="/privacy" className="underline">למדיניות הפרטיות</a>
                        </p>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
