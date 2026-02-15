
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/subscription-context';

interface SubscriptionLimitAlertProps {
  resourceType: 'car' | 'lead' | 'task' | 'template' | 'whatsappMessage';
  currentCount: number;
  showWarning?: boolean;
}

export function SubscriptionLimitAlert({ 
  resourceType, 
  currentCount, 
  showWarning = true 
}: SubscriptionLimitAlertProps) {
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  // Don't show upgrade alerts for paid subscribers
  if (subscription.subscription_status === 'active' || subscription.subscription_status === 'cancelled') {
    return null;
  }

  const resourceNames = {
    car: 'רכבים',
    lead: 'לקוחות פוטנציאליים', 
    task: 'משימות',
    template: 'תבניות הודעות',
    whatsappMessage: 'הודעות וואטסאפ'
  };

  const limitKey = `${resourceType}Limit` as keyof typeof subscription;
  const limit = subscription[limitKey] as number;

  if (limit === Infinity) {
    return null;
  }

  const percentage = Math.round((currentCount / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= limit;

  if (!showWarning && !isAtLimit) {
    return null;
  }

  return (
    <Alert className={`mb-4 ${isAtLimit ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : 'text-yellow-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div className="text-right flex-1">
          {isAtLimit ? (
            <span className="text-red-800 font-medium">
              הגעת למגבלת ה{resourceNames[resourceType]} בחבילת {subscription.tier} ({currentCount}/{limit})
            </span>
          ) : isNearLimit ? (
            <span className="text-yellow-800 font-medium">
              אתה משתמש ב-{currentCount} מתוך {limit} {resourceNames[resourceType]} ({percentage}%)
            </span>
          ) : null}
        </div>
        <Button
          onClick={() => navigate('/subscription/upgrade')}
          size="sm"
          className={`mr-4 ${isAtLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
        >
          שדרג חבילה
        </Button>
      </AlertDescription>
    </Alert>
  );
}
