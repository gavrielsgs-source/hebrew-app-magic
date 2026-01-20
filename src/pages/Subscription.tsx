import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Star, Zap, LogOut, CreditCard, TrendingUp } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useTasks } from "@/hooks/use-tasks";
import { UsageBar } from "@/components/subscription/UsageBar";
import { MobileContainer } from "@/components/mobile/MobileContainer";

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
      "משימות ללא הגבלה",
      "5 תבניות הודעות",
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
      "משימות ללא הגבלה",
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
      "תבניות הודעות ללא הגבלה",
      "2000 הודעות וואטסאפ לחודש",
      "משימות ללא הגבלה",
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

  const currentUsage = {
    leads: leads?.length || 0,
    cars: cars?.length || 0,
    tasks: tasks?.length || 0
  };

  // Mobile View
  if (isMobile) {
    return (
      <MobileContainer className="bg-background" withPadding={false}>
        <div className="space-y-4 p-4 pb-24" dir="rtl">
          {/* Header */}
          <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-l from-primary to-primary/80 p-6">
              <div className="flex items-center justify-between">
                <div className="text-primary-foreground text-right">
                  <h1 className="text-xl font-bold mb-1">ניהול מנוי</h1>
                  <p className="text-primary-foreground/80 text-sm">
                    בדוק את פרטי המנוי שלך
                  </p>
                </div>
                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CreditCard className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
            </div>
          </Card>

          {/* Current Plan Card */}
          <Card className="shadow-lg rounded-2xl border-2">
            <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-right text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  {currentTier.name === "חינם" ? "חבילה בסיסית" : `חבילת ${currentTier.name}`}
                </CardTitle>
                {currentTier.mostPopular && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">מומלץ</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-right">
                {currentTier.description}
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Zap className="h-4 w-4 text-primary" />
                  תכונות עיקריות:
                </div>
                <ul className="space-y-2 pr-6">
                  {currentTier.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card className="shadow-lg rounded-2xl border-2">
            <CardHeader className="bg-gradient-to-l from-green-500/10 to-transparent border-b pb-4">
              <CardTitle className="text-right text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-green-500" />
                שימוש נוכחי
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {currentTier.id !== "enterprise" && (
              <Button 
                onClick={() => navigate("/subscription/upgrade")}
                className="w-full h-12 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
              >
                <TrendingUp className="h-4 w-4 ml-2" />
                שדרג מנוי
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full h-12 rounded-xl border-2"
            >
              <LogOut className="h-4 w-4 ml-2" />
              התנתקות
            </Button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-l from-primary to-primary/80 p-8">
            <div className="flex items-center justify-between">
              <div className="text-primary-foreground text-right">
                <h1 className="text-3xl font-bold mb-2">ניהול מנוי</h1>
                <p className="text-primary-foreground/80 text-lg">
                  בדוק את פרטי המנוי שלך ושדרג במידת הצורך
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-2xl border-2 h-full">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-right text-xl flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    {currentTier.name === "חינם" ? "חבילה בסיסית" : `חבילת ${currentTier.name}`}
                  </CardTitle>
                  {currentTier.mostPopular && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">מומלץ</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  {currentTier.description}
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Zap className="h-5 w-5 text-primary" />
                    תכונות עיקריות:
                  </div>
                  <div className="grid grid-cols-2 gap-3 pr-7">
                    {currentTier.features.map((feature, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Star className="h-5 w-5 text-green-500" />
                    שימוש נוכחי:
                  </div>
                  <div className="space-y-4 pr-7">
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-lg rounded-2xl border-2 bg-gradient-to-b from-primary/5 to-transparent">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {currentTier.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentTier.price !== "חינם" ? "לחודש" : ""}
                  </div>
                </div>

                {currentTier.id !== "enterprise" ? (
                  <Button 
                    onClick={() => navigate("/subscription/upgrade")}
                    className="w-full h-12 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
                  >
                    <TrendingUp className="h-4 w-4 ml-2" />
                    שדרג מנוי
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    יצרנו איתך קשר לגבי תוכנית האנטרפרייז שלך.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl border-2">
              <CardContent className="p-6">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full h-12 rounded-xl border-2"
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  התנתקות
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
