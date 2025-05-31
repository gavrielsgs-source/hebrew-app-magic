import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Crown, Star, Zap, Check, X } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const subscriptionTiers = [
  {
    id: "free",
    name: "חינם",
    description: "התחילו עם תכונות בסיסיות בחינם",
    features: [
      "עד 3 משתמשים",
      "ניהול לידים בסיסי",
      "5GB אחסון",
    ],
    limitations: {
      users: 3,
      storage: 5,
    },
    price: "חינם",
    mostPopular: false,
  },
  {
    id: "premium",
    name: "פרימיום",
    description: "תכונות מתקדמות לעסקים קטנים",
    features: [
      "עד 10 משתמשים",
      "ניהול לידים מתקדם",
      "25GB אחסון",
      "תמיכה טכנית",
    ],
    limitations: {
      users: 10,
      storage: 25,
    },
    price: "199 ₪",
    mostPopular: true,
  },
  {
    id: "business",
    name: "ביזנס",
    description: "פתרון מלא לעסקים בינוניים",
    features: [
      "עד 25 משתמשים",
      "ניהול לידים מתקדם",
      "100GB אחסון",
      "תמיכה טכנית 24/7",
      "אינטגרציות API",
    ],
    limitations: {
      users: 25,
      storage: 100,
    },
    price: "349 ₪",
    mostPopular: false,
  },
  {
    id: "enterprise",
    name: "אנטרפרייז",
    description: "פתרון מותאם אישית לעסקים גדולים",
    features: [
      "מספר משתמשים ללא הגבלה",
      "ניהול לידים מתקדם",
      "אחסון ללא הגבלה",
      "תמיכה טכנית VIP",
      "אינטגרציות API מתקדמות",
      "הדרכה מותאמת אישית",
    ],
    limitations: {
      users: Infinity,
      storage: Infinity,
    },
    price: "599 ₪",
    mostPopular: false,
  },
];

export default function Subscription() {
  const { subscription, isLoading, error } = useSubscription();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("התנתקת בהצלחה!");
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("אירעה שגיאה בעת התנתקות");
    }
  };

  const getSubscriptionTier = () => {
    const tier = subscriptionTiers.find((tier) => tier.id === subscription.tier);
    return tier || subscriptionTiers[0];
  };

  const currentTier = getSubscriptionTier();

  return (
    <div className={`container mx-auto py-10 px-4 ${isMobile ? 'pb-24' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} mb-8`}>
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>ניהול מנוי</h1>
          <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-sm' : ''}`}>
            בדוק את פרטי המנוי שלך ושדרג במידת הצורך
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className={isMobile ? 'self-start' : ''}>
          התנתקות
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {currentTier.name === "חינם" ? "חבילה בסיסית" : `חבילת ${currentTier.name}`}
              {currentTier.mostPopular && <Badge className="ml-2">מומלץ</Badge>}
            </CardTitle>
            {currentTier.name !== "חינם" && <Crown className="h-4 w-4 text-yellow-500" />}
          </div>
          <CardDescription>{currentTier.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-blue-500" />
            תכונות עיקריות:
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {currentTier.features.map((feature, index) => (
              <li key={index} className="text-sm">
                {feature}
              </li>
            ))}
          </ul>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-2 text-green-500" />
            מגבלות שימוש:
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">מספר משתמשים:</span>
              <div className="flex items-center">
                <Progress value={
                  currentTier.limitations.users === Infinity ? 100 :
                    (subscription.users / currentTier.limitations.users) * 100
                } className="w-24 mr-2" />
                <span className="text-xs text-muted-foreground">
                  {subscription.users} / {currentTier.limitations.users === Infinity ? "ללא הגבלה" : currentTier.limitations.users}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">נפח אחסון:</span>
              <div className="flex items-center">
                <Progress value={
                  currentTier.limitations.storage === Infinity ? 100 :
                    (subscription.storage / currentTier.limitations.storage) * 100
                } className="w-24 mr-2" />
                <span className="text-xs text-muted-foreground">
                  {subscription.storage}GB / {currentTier.limitations.storage === Infinity ? "ללא הגבלה" : currentTier.limitations.storage}GB
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        {currentTier.id === "enterprise" ? (
          <p className="text-sm text-muted-foreground">
            יצרנו איתך קשר לגבי תוכנית האנטרפרייז שלך.
          </p>
        ) : (
          <Button onClick={() => navigate("/subscription/upgrade")}>
            שדרג מנוי <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
