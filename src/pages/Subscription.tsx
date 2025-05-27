
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { Crown, CreditCard, History, ArrowUpRight, Info, BarChart3, Users, Car, FileText, MessageSquare, Activity } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
                  <Crown className="h-8 w-8 text-carslead-lightblue" />
                  ניהול מנוי
                </h1>
                <div className="space-y-2">
                  <p className="text-xl">
                    <span className="text-carslead-lightblue">המנוי הנוכחי שלך: </span>
                    <span className="font-bold">{getTierLabel(subscription.tier)}</span>
                  </p>
                  {subscription.expiresAt && (
                    <p className="text-carslead-lightblue opacity-90">
                      בתוקף עד: {new Date(subscription.expiresAt).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                  <History className="h-4 w-4 ml-2" />
                  היסטוריית חיובים
                </Button>
                <Button className="bg-white text-carslead-purple hover:bg-gray-100">
                  <CreditCard className="h-4 w-4 ml-2" />
                  נהל פרטי תשלום
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-end">
          <Button asChild className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple hover:from-carslead-lightpurple hover:to-carslead-purple text-white h-12 px-6 rounded-lg font-medium">
            <Link to="/subscription/upgrade">
              <ArrowUpRight className="h-4 w-4 ml-2" />
              שדרג מנוי
            </Link>
          </Button>
        </div>
        
        {/* Tabs Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <Tabs defaultValue="plans" dir="rtl" className="p-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1">
              <TabsTrigger 
                value="plans"
                className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm"
              >
                <Crown className="h-4 w-4 ml-2" />
                חבילות
              </TabsTrigger>
              <TabsTrigger 
                value="usage"
                className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm"
              >
                <BarChart3 className="h-4 w-4 ml-2" />
                שימוש
              </TabsTrigger>
              <TabsTrigger 
                value="limits"
                className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm"
              >
                <Info className="h-4 w-4 ml-2" />
                מגבלות
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="plans" className="mt-0">
                <PricingPlans />
              </TabsContent>
              
              <TabsContent value="usage" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">סקירת שימוש נוכחי</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <UsageCard 
                        title="רכבים" 
                        icon={Car}
                        limit={subscription.carLimit} 
                        used={usageCounts.cars} 
                        isLoading={isLoading}
                      />
                      <UsageCard 
                        title="לקוחות" 
                        icon={Users}
                        limit={subscription.leadLimit} 
                        used={usageCounts.leads}
                        isLoading={isLoading}
                      />
                      <UsageCard 
                        title="תבניות" 
                        icon={MessageSquare}
                        limit={subscription.templateLimit} 
                        used={usageCounts.templates}
                        isLoading={isLoading}
                      />
                      <UsageCard 
                        title="משתמשים" 
                        icon={Users}
                        limit={subscription.userLimit} 
                        used={usageCounts.users}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="limits" className="mt-0">
                <div className="space-y-8">
                  <div className="bg-gradient-to-l from-gray-50 to-white border border-gray-200 rounded-xl p-8">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
                      <Info className="h-6 w-6 text-carslead-purple" />
                      מגבלות תכנית {getTierLabel(subscription.tier)}
                    </h3>
                    
                    <div className="space-y-6">
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
                    
                    <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
                      <h4 className="font-semibold mb-4 text-gray-900">תכונות מתקדמות:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button asChild size="lg" className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple hover:from-carslead-lightpurple hover:to-carslead-purple text-white h-14 px-8 rounded-xl font-medium">
                      <Link to="/subscription/upgrade">
                        <ArrowUpRight className="h-5 w-5 ml-2" />
                        שדרג את המנוי שלך לקבלת יותר משאבים
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

interface UsageCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  limit?: number;
  used: number;
  isLoading?: boolean;
}

function UsageCard({ title, icon: Icon, limit = Infinity, used, isLoading = false }: UsageCardProps) {
  const percentage = limit === Infinity ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : 'bg-carslead-purple/10'
          }`}>
            <Icon className={`h-5 w-5 ${
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-carslead-purple'
            }`} />
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold mb-3 text-gray-900">
            {used} <span className="text-sm font-normal text-gray-500">/ {limit === Infinity ? '∞' : limit}</span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-gradient-to-l from-carslead-purple to-carslead-lightpurple'
              }`}
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium ${
        available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {available ? '✓' : '✗'}
      </div>
      <div className="flex-1">
        <span className="text-gray-900">{feature}</span>
        {!available && (
          <span className="text-sm text-gray-500 block">
            (זמין במנויים מתקדמים)
          </span>
        )}
      </div>
    </div>
  );
}
