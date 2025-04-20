
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from '@/contexts/subscription-context';
import { Subscription } from '@/types/subscription'; // Import the Subscription type

interface SubscriptionLimitAlertProps {
  featureKey: keyof Subscription;
  currentCount: number;
  entityName: string;
}

export function SubscriptionLimitAlert({ featureKey, currentCount, entityName }: SubscriptionLimitAlertProps) {
  const { subscription } = useSubscription();
  
  // Get the limit for this feature
  const limit = subscription[featureKey] as number;
  
  if (!limit || limit === Infinity) {
    // If there's no limit or it's infinite, don't show anything
    return null;
  }
  
  // Calculate percentage used
  const percentUsed = (currentCount / limit) * 100;
  
  // Only show an alert if we're at 80% or more of the limit
  if (percentUsed < 80) {
    return null;
  }
  
  // If at limit or beyond, show destructive alert. Otherwise show warning
  const isAtLimit = currentCount >= limit;
  const variant = isAtLimit ? "destructive" : "default" as const;
  
  return (
    <Alert 
      variant={variant}
      className={`mb-6 ${isAtLimit ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/50' : 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/50'}`}
    >
      <AlertCircle className={`h-4 w-4 ${isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
      <AlertTitle className={`${isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {isAtLimit ? 'הגעת למגבלת המנוי' : 'מתקרב למגבלת המנוי'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {isAtLimit ? 
          `הגעת למספר ה${entityName} המקסימלי (${limit}) במנוי שלך. שדרג את המנוי כדי להוסיף יותר ${entityName}.` :
          `אתה משתמש ב-${currentCount} מתוך ${limit} ${entityName} המותרים במנוי שלך (${Math.round(percentUsed)}%). שקול לשדרג את המנוי שלך.`
        }
      </AlertDescription>
    </Alert>
  );
}
