
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/subscription-context";
import { Link } from "react-router-dom";

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
        "עד 2 משתמשים במערכת",
        "5 תבניות מובנות לוואטסאפ", // עודכן
        "100 הודעות וואטסאפ לחודש",
        "עד 20 משימות",
        "דשבורד בסיסי"
      ],
      tier: "premium"
    },
    {
      name: "ביזנס",
      description: "מתאים לסוכנויות בינוניות (3-7 אנשי צוות)",
      price: "399 ₪",
      features: [
        "ניהול עד 50 רכבים במלאי",
        "ניהול עד 200 לקוחות",
        "עד 5 משתמשים במערכת",
        "10 תבניות וואטסאפ", // עודכן
        "500 הודעות וואטסאפ לחודש",
        "עד 100 משימות",
        "תגיות מתקדמות ללקוחות",
        "שליחה לקבוצות לקוחות לפי תגיות",
        "דוחות ביצועים מתקדמים"
      ],
      tier: "business"
    },
    {
      name: "אנטרפרייז",
      description: "מתאים למגרשים גדולים ורשתות סוכנויות",
      price: "699 ₪",
      features: [
        "רכבים ולקוחות ללא הגבלה",
        "עד 10 משתמשים במערכת",
        "משימות ללא הגבלה",
        "תבניות הודעה ללא הגבלה", // עודכן
        "2000 הודעות וואטסאפ לחודש",
        "אוטומציה של תזכורות ומעקב",
        "דוחות מתקדמים וניתוח ביצועים",
        "אנליטיקה מותאמת אישית",
        "ייצוא נתונים",
        "API מלא"
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
              asChild
            >
              {subscription.tier === plan.tier ? (
                <span>החבילה הנוכחית שלך</span>
              ) : (
                <Link to="/subscription/upgrade">שדרג עכשיו</Link>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
