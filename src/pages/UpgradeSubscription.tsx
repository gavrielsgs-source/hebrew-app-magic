
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { toast } from "sonner";

export default function UpgradeSubscription() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  const plans = [
    {
      id: "premium",
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
      id: "business",
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
      id: "enterprise",
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

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // כאן בהמשך יהיה קוד שמבצע תשלום דרך Stripe
      // לצורך הדמו, אנחנו רק מציגים הודעת הצלחה
      setTimeout(() => {
        toast.success(`שדרוג לחבילת ${planId} בוצע בהצלחה!`, {
          description: "המערכת תתעדכן בקרוב עם הפרמטרים החדשים."
        });
        setLoading(false);
        navigate("/subscription");
      }, 1500);
    } catch (error) {
      toast.error("שגיאה בתהליך השדרוג", {
        description: "אנא נסה שוב מאוחר יותר."
      });
      setLoading(false);
    }
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
                  "שדרג עכשיו"
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
    </div>
  );
}
