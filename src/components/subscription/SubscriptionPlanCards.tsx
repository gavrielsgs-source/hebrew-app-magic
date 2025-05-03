
import { useState } from "react";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/subscription-context";

interface PlanType {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  features: string[];
  tier: string;
}

interface SubscriptionPlanCardsProps {
  selectedPlan: string | null;
  setSelectedPlan: (plan: string | null) => void;
  handleUpgrade: (planId: string) => void;
  loading: boolean;
}

export function SubscriptionPlanCards({ 
  selectedPlan, 
  setSelectedPlan, 
  handleUpgrade, 
  loading 
}: SubscriptionPlanCardsProps) {
  const { subscription } = useSubscription();

  const plans: PlanType[] = [
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
        "דוחות מתקדמים וניתוח ביצועים",
        "ייצוא נתונים"
      ],
      tier: "enterprise"
    }
  ];

  return (
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
  );
}
