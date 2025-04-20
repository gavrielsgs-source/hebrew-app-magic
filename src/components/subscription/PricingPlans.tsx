
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/subscription-context";

export function PricingPlans() {
  const { subscription } = useSubscription();
  
  const plans = [
    {
      name: "פרימיום",
      description: "מתאים לסוחרים קטנים (1-2 אנשי צוות)",
      price: "199 ₪",
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
      name: "ביזנס",
      description: "מתאים לסוכנויות בינוניות (3-7 אנשי צוות)",
      price: "349 ₪",
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
      name: "אנטרפרייז",
      description: "מתאים למגרשים גדולים ורשתות סוכנויות",
      price: "599 ₪",
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
          key={plan.tier}
          className={subscription.tier === plan.tier ? "border-primary border-2" : ""}
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
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={subscription.tier === plan.tier ? "outline" : "default"}
              disabled={subscription.tier === plan.tier}
            >
              {subscription.tier === plan.tier ? "החבילה הנוכחית שלך" : "שדרג עכשיו"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
