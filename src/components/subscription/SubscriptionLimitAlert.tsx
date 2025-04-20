
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionTier } from '@/types/subscription';

interface SubscriptionLimitAlertProps {
  featureKey: 'carLimit' | 'leadLimit' | 'templateLimit' | 'userLimit';
  currentCount: number;
  entityName: string;
}

export function SubscriptionLimitAlert({ 
  featureKey, 
  currentCount, 
  entityName 
}: SubscriptionLimitAlertProps) {
  const { subscription } = useSubscription();
  const limit = subscription[featureKey];
  
  if (!limit || typeof limit !== 'number' || limit === Infinity || currentCount < limit * 0.8) {
    return null;
  }
  
  const isAtLimit = currentCount >= limit;
  const isNearLimit = currentCount >= limit * 0.8 && currentCount < limit;
  
  const getNextTier = (): SubscriptionTier => {
    switch (subscription.tier) {
      case 'free': return 'premium';
      case 'premium': return 'business';
      case 'business': return 'enterprise';
      default: return 'enterprise';
    }
  };

  const getTierLabel = (tier: SubscriptionTier): string => {
    switch (tier) {
      case 'free': return 'חינם';
      case 'premium': return 'פרימיום';
      case 'business': return 'ביזנס';
      case 'enterprise': return 'אנטרפרייז';
    }
  };
  
  return (
    <Alert variant={isAtLimit ? "destructive" : "warning"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="mr-2">
        {isAtLimit 
          ? `הגעת למגבלת ${entityName} בחבילה שלך` 
          : `מתקרב למגבלת ${entityName} בחבילה שלך`}
      </AlertTitle>
      <AlertDescription className="flex flex-col md:flex-row md:items-center md:justify-between mt-2">
        <div>
          <span>
            {isAtLimit 
              ? `חבילת ${getTierLabel(subscription.tier)} שלך מוגבלת ל-${limit} ${entityName}.` 
              : `חבילת ${getTierLabel(subscription.tier)} שלך מוגבלת ל-${limit} ${entityName}. כרגע יש לך ${currentCount}.`}
          </span>
        </div>
        <Button 
          className="mt-2 md:mt-0"
          variant={isAtLimit ? "default" : "outline"}
          size="sm"
        >
          שדרג לחבילת {getTierLabel(getNextTier())}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
