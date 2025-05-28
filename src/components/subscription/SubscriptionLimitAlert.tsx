
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from '@/contexts/subscription-context';
import { Subscription } from '@/types/subscription';

interface SubscriptionLimitAlertProps {
  featureKey: keyof Subscription;
  currentCount: number;
  entityName: string;
}

export function SubscriptionLimitAlert({ featureKey, currentCount, entityName }: SubscriptionLimitAlertProps) {
  const { subscription } = useSubscription();
  
  // Get the limit for this feature
  const limit = subscription[featureKey] as number;
  
  console.log('SubscriptionLimitAlert Debug:', {
    featureKey,
    currentCount,
    entityName,
    limit,
    subscription
  });
  
  if (!limit || limit === Infinity) {
    console.log('SubscriptionLimitAlert: No limit or infinite limit, not showing alert');
    return null;
  }
  
  // Calculate percentage used
  const percentUsed = (currentCount / limit) * 100;
  
  console.log('SubscriptionLimitAlert: Percent used:', percentUsed);
  
  // Show alert if we're at 70% or more of the limit (lowered threshold for better UX)
  if (percentUsed < 70) {
    console.log('SubscriptionLimitAlert: Below 70% threshold, not showing alert');
    return null;
  }
  
  // If at limit or beyond, show destructive alert. Otherwise show warning
  const isAtLimit = currentCount >= limit;
  const variant = isAtLimit ? "destructive" : "default" as const;
  
  console.log('SubscriptionLimitAlert: Showing alert', { isAtLimit, variant });
  
  return (
    <Alert 
      variant={variant}
      className={`mb-4 mx-4 md:mx-0 md:mb-6 ${
        isAtLimit 
          ? 'border-red-200 dark:border-red-900 bg-red-50/90 dark:bg-red-950/90' 
          : 'border-amber-200 dark:border-amber-900 bg-amber-50/90 dark:bg-amber-950/90'
      } rounded-xl shadow-sm`}
      dir="rtl"
    >
      <AlertCircle className={`h-4 w-4 ${
        isAtLimit 
          ? 'text-red-600 dark:text-red-400' 
          : 'text-amber-600 dark:text-amber-400'
      }`} />
      <AlertTitle className={`text-sm md:text-base font-semibold ${
        isAtLimit 
          ? 'text-red-700 dark:text-red-300' 
          : 'text-amber-700 dark:text-amber-300'
      }`}>
        {isAtLimit ? 'הגעת למגבלת המנוי' : 'מתקרב למגבלת המנוי'}
      </AlertTitle>
      <AlertDescription className={`mt-2 text-xs md:text-sm leading-relaxed ${
        isAtLimit 
          ? 'text-red-600 dark:text-red-400' 
          : 'text-amber-600 dark:text-amber-400'
      }`}>
        {isAtLimit ? 
          `הגעת למספר ה${entityName} המקסימלי (${limit}) במנוי שלך. שדרג את המנוי כדי להוסיף יותר ${entityName}.` :
          `אתה משתמש ב-${currentCount} מתוך ${limit} ${entityName} המותרים במנוי שלך (${Math.round(percentUsed)}%). שקול לשדרג את המנוי שלך.`
        }
      </AlertDescription>
    </Alert>
  );
}
