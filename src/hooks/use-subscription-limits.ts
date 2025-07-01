
import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/subscription-context';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SubscriptionTier } from '@/types/subscription';

export type ResourceType = 'car' | 'lead' | 'user' | 'template' | 'whatsappMessage' | 'task';

/**
 * Hook לבדיקת מגבלות מנוי לפני יצירה או עדכון של משאבים
 */
export function useSubscriptionLimits() {
  const { subscription, checkEntitlement } = useSubscription();
  const navigate = useNavigate();

  /**
   * בדיקה האם פעולה מסוימת מותרת לפי מגבלות המנוי
   */
  const checkLimitBeforeAction = (
    resourceType: ResourceType,
    action: 'create' | 'update' | 'delete',
    currentCount: number
  ): { allowed: boolean; message: string } => {
    console.log('🔍 [useSubscriptionLimits] checkLimitBeforeAction called:', {
      resourceType,
      action,
      currentCount,
      subscription: {
        tier: subscription.tier,
        active: subscription.active,
        leadLimit: subscription.leadLimit,
        carLimit: subscription.carLimit
      },
      timestamp: new Date().toISOString()
    });

    // מחיקה תמיד מותרת
    if (action === 'delete') {
      console.log('🔍 [useSubscriptionLimits] Delete action - always allowed');
      return { allowed: true, message: '' };
    }

    // בדיקה רק עבור יצירת משאב חדש
    if (action === 'create') {
      const limitKey = `${resourceType}Limit` as keyof typeof subscription;
      const limit = subscription[limitKey] as number | undefined;

      console.log('🔍 [useSubscriptionLimits] Create action limit check:', {
        limitKey,
        limit,
        currentCount,
        subscription: subscription,
        limitType: typeof limit
      });

      if (!limit || limit === Infinity) {
        console.log('🔍 [useSubscriptionLimits] No limit or infinite limit, allowing action');
        return { allowed: true, message: '' };
      }

      // תיקון הלוגיקה: בודק אם currentCount קטן מהמגבלה
      const wouldExceedLimit = currentCount >= limit;
      
      console.log('🔍 [useSubscriptionLimits] Limit calculation:', {
        currentCount,
        limit,
        wouldExceedLimit,
        calculation: `${currentCount} >= ${limit} = ${wouldExceedLimit}`
      });

      if (wouldExceedLimit) {
        const resourceNames: Record<ResourceType, string> = {
          car: 'רכבים',
          lead: 'לקוחות פוטנציאליים',
          user: 'משתמשים',
          template: 'תבניות',
          whatsappMessage: 'הודעות וואטסאפ',
          task: 'משימות'
        };

        const message = `הגעת למגבלת ה${resourceNames[resourceType]} במנוי ${getTierLabel(subscription.tier)} (${currentCount}/${limit}). שדרג לחבילה גבוהה יותר.`;
        
        console.log('🔍 [useSubscriptionLimits] Limit exceeded:', { 
          currentCount, 
          limit, 
          message,
          resourceType,
          tierLabel: getTierLabel(subscription.tier)
        });
        
        return {
          allowed: false,
          message
        };
      }
    }

    console.log('🔍 [useSubscriptionLimits] Action allowed');
    return { allowed: true, message: '' };
  };

  /**
   * הצגת התראה ובדיקת מגבלה לפני יצירת משאב חדש
   */
  const checkAndNotifyLimit = (
    resourceType: ResourceType,
    currentCount: number,
    onContinue?: () => void,
    onUpgrade?: () => void
  ): boolean => {
    console.log('🔍 [useSubscriptionLimits] checkAndNotifyLimit called:', {
      resourceType,
      currentCount,
      subscription: subscription
    });

    const result = checkLimitBeforeAction(resourceType, 'create', currentCount);

    console.log('🔍 [useSubscriptionLimits] checkAndNotifyLimit result:', result);

    if (!result.allowed) {
      toast.error(result.message, {
        action: {
          label: 'שדרג מנוי',
          onClick: () => {
            if (onUpgrade) {
              onUpgrade();
            } else {
              navigate('/subscription/upgrade');
            }
          }
        }
      });
      return false;
    }

    // בדיקה אם מתקרבים למגבלה (80% ומעלה)
    const limitKey = `${resourceType}Limit` as keyof typeof subscription;
    const limit = subscription[limitKey] as number | undefined;

    if (limit && limit !== Infinity) {
      const percentUsed = Math.round((currentCount / limit) * 100);
      
      console.log('🔍 [useSubscriptionLimits] Usage percentage:', {
        currentCount,
        limit,
        percentUsed
      });
      
      if (percentUsed >= 80) {
        const resourceNames: Record<ResourceType, string> = {
          car: 'רכבים',
          lead: 'לקוחות פוטנציאליים',
          user: 'משתמשים',
          template: 'תבניות',
          whatsappMessage: 'הודעות וואטסאפ',
          task: 'משימות'
        };

        toast.warning(
          `אתה משתמש ב-${currentCount} מתוך ${limit} ${resourceNames[resourceType]} (${percentUsed}%). שקול לשדרג בקרוב.`,
          {
            action: {
              label: 'שדרג מנוי',
              onClick: () => {
                if (onUpgrade) {
                  onUpgrade();
                } else {
                  navigate('/subscription/upgrade');
                }
              }
            }
          }
        );
      }
    }

    if (onContinue) {
      onContinue();
    }
    return true;
  };

  /**
   * בדיקה האם פונקציונליות מתקדמת זמינה במנוי הנוכחי
   */
  const isFeatureAvailable = (
    feature: 'advancedAnalytics' | 'customReports' | 'automatedWorkflows' | 'apiAccess'
  ): boolean => {
    const featureAvailability: Record<string, SubscriptionTier[]> = {
      advancedAnalytics: ['business', 'enterprise'],
      customReports: ['enterprise'],
      automatedWorkflows: ['business', 'enterprise'],
      apiAccess: ['enterprise']
    };

    return featureAvailability[feature].includes(subscription.tier);
  };

  const getTierLabel = (tier: string): string => {
    switch (tier) {
      case 'free': return 'חינם';
      case 'premium': return 'פרימיום';
      case 'business': return 'ביזנס';
      case 'enterprise': return 'אנטרפרייז';
      default: return tier;
    }
  };

  console.log('🔍 [useSubscriptionLimits] Hook returning functions with subscription:', {
    tier: subscription.tier,
    leadLimit: subscription.leadLimit,
    carLimit: subscription.carLimit
  });

  return {
    checkLimitBeforeAction,
    checkAndNotifyLimit,
    isFeatureAvailable,
    getTierLabel
  };
}
