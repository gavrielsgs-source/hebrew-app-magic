
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { Crown, CreditCard, History, ArrowUpRight, Info } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { Link } from "react-router-dom";
import { UsageBar } from "@/components/subscription/UsageBar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";

export default function Subscription() {
  const { subscription } = useSubscription();
  const { getTierLabel } = useSubscriptionLimits();
  const [usageCounts, setUsageCounts] = useState({
    cars: 0,
    leads: 0,
    users: 0,
    templates: 0,
    tasks: 0,
    whatsappMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // פונקציה לשליפת נתוני שימוש עדכניים
  useEffect(() => {
    const fetchUsageCounts = async () => {
      try {
        setIsLoading(true);
        
        // שליפת מספר הרכבים
        const { count: carsCount, error: carsError } = await supabase
          .from('cars')
          .select('*', { count: 'exact', head: true });
          
        if (carsError) throw carsError;
        
        // שליפת מספר הלידים
        const { count: leadsCount, error: leadsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        if (leadsError) throw leadsError;
        
        // שליפת מספר המשתמשים
        const { count: usersCount, error: usersError } = await supabase
          .from('user_roles')
          .select('user_id', { count: 'exact', head: true })
          .is('agency_id', null);
          
        if (usersError) throw usersError;
        
        // שליפת מספר המשימות
        const { count: tasksCount, error: tasksError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });
          
        if (tasksError) throw tasksError;
        
        // עדכון המדדים
        setUsageCounts({
          cars: carsCount || 0,
          leads: leadsCount || 0,
          users: usersCount || 0,
          templates: 2, // לדוגמה בלבד - צריך לעדכן לשליפה אמיתית
          tasks: tasksCount || 0,
          whatsappMessages: 0 // לדוגמה בלבד - צריך לעדכן לשליפה אמיתית
        });
        
      } catch (error) {
        console.error("Error fetching usage counts:", error);
        toast.error("שגיאה בטעינת נתוני שימוש");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageCounts();
  }, []);

  return (
    <div className="container py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">ניהול מנוי</h1>
      
      <div className="bg-muted/30 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-medium">
            <span>המנוי הנוכחי שלך: </span>
            <span className="text-primary font-bold">{getTierLabel(subscription.tier)}</span>
          </h2>
          {subscription.expiresAt && (
            <p className="text-muted-foreground">
              בתוקף עד: {new Date(subscription.expiresAt).toLocaleDateString('he-IL')}
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            היסטוריית חיובים
          </Button>
          <Button className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            נהל פרטי תשלום
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button asChild className="flex items-center gap-2">
          <Link to="/subscription/upgrade">
            <ArrowUpRight className="h-4 w-4" />
            שדרג מנוי
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="plans" dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="plans">חבילות</TabsTrigger>
          <TabsTrigger value="usage">שימוש</TabsTrigger>
          <TabsTrigger value="limits">מגבלות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <PricingPlans />
        </TabsContent>
        
        <TabsContent value="usage">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <UsageCard 
              title="רכבים" 
              limit={subscription.carLimit} 
              used={usageCounts.cars} 
              isLoading={isLoading}
            />
            <UsageCard 
              title="לקוחות" 
              limit={subscription.leadLimit} 
              used={usageCounts.leads}
              isLoading={isLoading}
            />
            <UsageCard 
              title="תבניות" 
              limit={subscription.templateLimit} 
              used={usageCounts.templates}
              isLoading={isLoading}
            />
            <UsageCard 
              title="משתמשים" 
              limit={subscription.userLimit} 
              used={usageCounts.users}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="limits">
          <div className="space-y-6">
            <div className="bg-card shadow-sm border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                מגבלות תכנית {getTierLabel(subscription.tier)}
              </h3>
              
              <div className="space-y-4">
                <UsageBar 
                  label="רכבים במלאי" 
                  used={usageCounts.cars} 
                  limit={subscription.carLimit || Infinity}
                />
                
                <UsageBar 
                  label="לקוחות פוטנציאליים" 
                  used={usageCounts.leads} 
                  limit={subscription.leadLimit || Infinity}
                />
                
                <UsageBar 
                  label="משתמשים במערכת" 
                  used={usageCounts.users} 
                  limit={subscription.userLimit || Infinity}
                />
                
                <UsageBar 
                  label="תבניות מותאמות אישית" 
                  used={usageCounts.templates} 
                  limit={subscription.templateLimit || Infinity}
                />
                
                <UsageBar 
                  label="משימות אקטיביות" 
                  used={usageCounts.tasks} 
                  limit={subscription.taskLimit || Infinity}
                />
                
                <UsageBar 
                  label="הודעות וואטסאפ בחודש" 
                  used={usageCounts.whatsappMessages} 
                  limit={subscription.whatsappMessageLimit || Infinity}
                />
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">תכונות מתקדמות:</h4>
                <ul className="space-y-2">
                  <FeatureListItem 
                    feature="אנליטיקה מתקדמת" 
                    available={subscription.analyticsLevel !== 'basic'} 
                  />
                  <FeatureListItem 
                    feature="דוחות מותאמים אישית" 
                    available={subscription.analyticsLevel === 'custom'} 
                  />
                  <FeatureListItem 
                    feature="תהליכי עבודה אוטומטיים" 
                    available={subscription.tier !== 'free' && subscription.tier !== 'premium'} 
                  />
                  <FeatureListItem 
                    feature="גישה ל-API" 
                    available={subscription.tier === 'enterprise'} 
                  />
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button asChild size="lg">
                <Link to="/subscription/upgrade">
                  <ArrowUpRight className="h-5 w-5 mr-2" />
                  שדרג את המנוי שלך לקבלת יותר משאבים
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface UsageCardProps {
  title: string;
  limit?: number;
  used: number;
  isLoading?: boolean;
}

function UsageCard({ title, limit = Infinity, used, isLoading = false }: UsageCardProps) {
  const percentage = limit === Infinity ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{title}</h3>
        <Crown className={`h-4 w-4 ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-orange-500' : 'text-muted-foreground'}`} />
      </div>
      
      {isLoading ? (
        <div className="h-10 bg-muted/50 rounded animate-pulse"></div>
      ) : (
        <>
          <div className="text-2xl font-bold mb-2">
            {used} <span className="text-sm font-normal text-muted-foreground">/ {limit === Infinity ? '∞' : limit}</span>
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-orange-500' : 'bg-primary'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface FeatureListItemProps {
  feature: string;
  available: boolean;
}

function FeatureListItem({ feature, available }: FeatureListItemProps) {
  return (
    <li className="flex items-center gap-3">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
        available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      }`}>
        {available ? '✓' : '✗'}
      </div>
      <span>{feature}</span>
      {!available && (
        <span className="text-sm text-muted-foreground">
          (במנויים מתקדמים)
        </span>
      )}
    </li>
  );
}
