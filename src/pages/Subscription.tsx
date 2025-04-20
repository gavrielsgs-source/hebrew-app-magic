
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { Crown, CreditCard, History } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";

export default function Subscription() {
  const { subscription } = useSubscription();

  const getTierLabel = (tier: string): string => {
    switch (tier) {
      case 'free': return 'חינם';
      case 'premium': return 'פרימיום';
      case 'business': return 'ביזנס';
      case 'enterprise': return 'אנטרפרייז';
    }
    return tier;
  };

  return (
    <div className="container py-8">
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
      
      <Tabs defaultValue="plans">
        <TabsList className="mb-4">
          <TabsTrigger value="plans">חבילות</TabsTrigger>
          <TabsTrigger value="usage">שימוש</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <PricingPlans />
        </TabsContent>
        
        <TabsContent value="usage">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <UsageCard 
              title="רכבים" 
              limit={subscription.carLimit} 
              used={12} 
            />
            <UsageCard 
              title="לקוחות" 
              limit={subscription.leadLimit} 
              used={38}
            />
            <UsageCard 
              title="תבניות" 
              limit={subscription.templateLimit} 
              used={2} 
            />
            <UsageCard 
              title="משתמשים" 
              limit={subscription.userLimit} 
              used={1} 
            />
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
}

function UsageCard({ title, limit = Infinity, used }: UsageCardProps) {
  const percentage = limit === Infinity ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{title}</h3>
        <Crown className={`h-4 w-4 ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-muted-foreground'}`} />
      </div>
      
      <div className="text-2xl font-bold mb-2">
        {used} <span className="text-sm font-normal text-muted-foreground">/ {limit === Infinity ? '∞' : limit}</span>
      </div>
      
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-warning' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
