
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
    // מחיקה תמיד מותרת
    if (action === 'delete') {
      return { allowed: true, message: '' };
    }

    // בדיקה רק עבור יצירת משאב חדש
    if (action === 'create') {
      const limitKey = `${resourceType}Limit` as keyof typeof subscription;
      const limit = subscription[limitKey] as number | undefined;

      if (!limit || limit === Infinity) {
        return { allowed: true, message: '' };
      }

      if (currentCount >= limit) {
        const resourceNames: Record<ResourceType, string> = {
          car: 'רכבים',
          lead: 'לידים',
          user: 'משתמשים',
          template: 'תבניות',
          whatsappMessage: 'הודעות וואטסאפ',
          task: 'משימות'
        };

        return {
          allowed: false,
          message: `הגעת למגבלת ה${resourceNames[resourceType]} במנוי ${getTierLabel(subscription.tier)}. שדרג לחבילה גבוהה יותר.`
        };
      }
    }

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
    const result = checkLimitBeforeAction(resourceType, 'create', currentCount);

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
      
      if (percentUsed >= 80) {
        const resourceNames: Record<ResourceType, string> = {
          car: 'רכבים',
          lead: 'לידים',
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

  return {
    checkLimitBeforeAction,
    checkAndNotifyLimit,
    isFeatureAvailable,
    getTierLabel
  };
}
