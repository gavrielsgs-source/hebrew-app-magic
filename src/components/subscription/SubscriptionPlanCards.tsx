
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, Crown } from "lucide-react";

interface SubscriptionPlanCardsProps {
  selectedPlan: string | null;
  setSelectedPlan: (plan: string) => void;
  handleUpgrade: (planId: string) => void;
  loading: boolean;
  isYearly: boolean;
}

export function SubscriptionPlanCards({
  selectedPlan,
  setSelectedPlan,
  handleUpgrade,
  loading,
  isYearly
}: SubscriptionPlanCardsProps) {
  const plans = [
    {
      id: "premium",
      name: "פרימיום",
      monthlyPrice: "₪199",
      yearlyPrice: "₪179",
      period: "לחודש",
      description: "מתאים לעסקים קטנים",
      icon: Star,
      popular: false,
      features: [
        "עד 50 רכבים במלאי",
        "עד 100 לקוחות פוטנציאליים",
        "תבניות הודעות מותאמות אישית",
        "אנליטיקה בסיסית",
        "תמיכה באימייל"
      ]
    },
    {
      id: "business",
      name: "ביזנס",
      monthlyPrice: "₪399",
      yearlyPrice: "₪349",
      period: "לחודש",
      description: "הפתרון הטוב ביותר לעסקים מתפתחים",
      icon: Zap,
      popular: true,
      features: [
        "עד 200 רכבים במלאי",
        "עד 500 לקוחות פוטנציאליים",
        "תבניות הודעות ללא הגבלה",
        "אנליטיקה מתקדמת",
        "ניהול משתמשים (עד 5)",
        "תמיכה בטלפון"
      ]
    },
    {
      id: "enterprise",
      name: "אנטרפרייז",
      monthlyPrice: "₪699",
      yearlyPrice: "₪619",
      period: "לחודש",
      description: "פתרון מתקדם לעסקים גדולים",
      icon: Crown,
      popular: false,
      features: [
        "רכבים ללא הגבלה",
        "לקוחות ללא הגבלה",
        "תבניות ותהליכים מותאמים אישית",
        "אנליטיקה מתקדמת + דוחות מותאמים",
        "ניהול משתמשים ללא הגבלה",
        "תמיכה VIP 24/7",
        "גישה ל-API"
      ]
    }
  ];

  const handlePlanClick = (planId: string) => {
    setSelectedPlan(planId);
    handleUpgrade(planId);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {plans.map((plan) => {
        const Icon = plan.icon;
        const isSelected = selectedPlan === plan.id;
        const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
        
        return (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
            } ${plan.popular ? 'border-primary' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                הכי פופולרי
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 text-right">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{displayPrice}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePlanClick(plan.id)}
                disabled={loading}
              >
                {loading && selectedPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    מעבד...
                  </span>
                ) : (
                  `בחר ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
