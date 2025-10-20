
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Star, Zap, Check, X } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useTasks } from "@/hooks/use-tasks";
import { UsageBar } from "@/components/subscription/UsageBar";

const subscriptionTiers = [
  {
    id: "free",
    name: "חינם",
    description: "התחילו עם תכונות בסיסיות בחינם",
    features: [
      "עד 10 לקוחות פוטנציאליים",
      "עד 5 רכבים במלאי",
      "עד 10 משימות",
      "תבנית הודעה אחת",
      "50 הודעות וואטסאפ לחודש"
    ],
    price: "חינם",
    mostPopular: false,
  },
  {
    id: "premium",
    name: "פרימיום",
    description: "תכונות מתקדמות לעסקים קטנים",
    features: [
      "עד 50 לקוחות פוטנציאליים",
      "עד 20 רכבים במלאי",
      "עד 20 משימות",
      "3 תבניות הודעות",
      "100 הודעות וואטסאפ לחודש",
      "תמיכה טכנית"
    ],
    price: "199 ₪",
    mostPopular: true,
  },
  {
    id: "business",
    name: "ביזנס",
    description: "פתרון מלא לעסקים בינוניים",
    features: [
      "עד 200 לקוחות פוטנציאליים",
      "עד 50 רכבים במלאי",
      "עד 100 משימות",
      "10 תבניות הודעות",
      "500 הודעות וואטסאפ לחודש",
      "אנליטיקה מתקדמת",
      "תמיכה טכנית 24/7"
    ],
    price: "399 ₪",
    mostPopular: false,
  },
  {
    id: "enterprise",
    name: "אנטרפרייז",
    description: "פתרון מותאם אישית לעסקים גדולים",
    features: [
      "לקוחות ללא הגבלה",
      "רכבים ללא הגבלה",
      "משימות ללא הגבלה",
      "תבניות הודעות ללא הגבלה",
      "2000 הודעות וואטסאפ לחודש",
      "אנליטיקה מותאמת אישית",
      "תמיכה VIP 24/7",
      "גישה ל-API"
    ],
    price: "699 ₪",
    mostPopular: false,
  },
];

export default function Subscription() {
  const { subscription, isLoading, error } = useSubscription();
  const { user, signOut } = useAuth();
  const { leads } = useLeads();
  const { cars } = useCars();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);

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

  // שימוש בנתונים אמיתיים
  const currentUsage = {
    leads: leads?.length || 0,
    cars: cars?.length || 0,
    tasks: tasks?.length || 0
  };

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
        <CardContent className="grid gap-6">
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
            שימוש נוכחי:
          </div>
          <div className="space-y-4">
            <UsageBar 
              used={currentUsage.leads}
              limit={subscription.leadLimit || 0}
              label="לקוחות פוטנציאליים"
            />
            <UsageBar 
              used={currentUsage.cars}
              limit={subscription.carLimit || 0}
              label="רכבים במלאי"
            />
            <UsageBar 
              used={currentUsage.tasks}
              limit={subscription.taskLimit || 0}
              label="משימות"
            />
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
