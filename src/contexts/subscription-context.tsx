
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subscription, SubscriptionTier, subscriptionFeatures } from '@/types/subscription';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  subscription: Subscription;
  isLoading: boolean;
  error: Error | null;
  checkEntitlement: (feature: keyof Subscription, value?: number) => boolean;
  refreshSubscription: () => Promise<void>;
  daysLeftInTrial: number;
  isTrialExpired: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(subscriptionFeatures.premium);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(14);
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  const fetchSubscription = async () => {
    console.log('🔍 [SubscriptionContext] fetchSubscription called', { user: user?.id });
    
    if (!user) {
      console.log('🔍 [SubscriptionContext] No user, setting premium subscription');
      const premiumSub = { ...subscriptionFeatures.premium };
      console.log('🔍 [SubscriptionContext] Setting subscription to premium:', {
        tier: premiumSub.tier,
        leadLimit: premiumSub.leadLimit,
        carLimit: premiumSub.carLimit,
        active: premiumSub.active
      });
      setSubscription(premiumSub);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [SubscriptionContext] Fetching subscription for user:', user.id);
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('subscription_tier, active, expires_at, trial_ends_at')
        .eq('user_id', user.id)
        .single();

      console.log('🔍 [SubscriptionContext] Raw subscription data:', subscriptionData);
      console.log('🔍 [SubscriptionContext] Subscription error:', subscriptionError);

      if (subscriptionError) {
        if (subscriptionError.code === 'PGRST116') {
          console.log('🔍 [SubscriptionContext] No subscription found, creating new trial');
          
          // אין מנוי עדיין, ניצור ניסיון חדש של 14 ימים
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 14);
          
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              subscription_tier: 'premium',
              active: true,
              trial_ends_at: trialEndDate.toISOString()
            });
          
          if (insertError) {
            console.error("🔍 [SubscriptionContext] Error creating subscription:", insertError);
          }
          
          // יצירת מנוי פרימיום עם ניסיון של 14 ימים
          const newSubscription: Subscription = {
            ...subscriptionFeatures.premium,
            isTrialActive: true,
            trialEndsAt: trialEndDate.toISOString(),
            active: true
          };
          
          console.log('🔍 [SubscriptionContext] New subscription created:', {
            tier: newSubscription.tier,
            leadLimit: newSubscription.leadLimit,
            carLimit: newSubscription.carLimit,
            isTrialActive: newSubscription.isTrialActive,
            active: newSubscription.active,
            trialEndsAt: newSubscription.trialEndsAt
          });
          
          setSubscription(newSubscription);
          setDaysLeftInTrial(14);
          setIsTrialExpired(false);
        } else {
          throw subscriptionError;
        }
      } else {
        const now = new Date();
        const trialEndDate = subscriptionData.trial_ends_at ? new Date(subscriptionData.trial_ends_at) : null;
        const isTrialActive = trialEndDate && trialEndDate > now;
        const trialExpired = trialEndDate && trialEndDate <= now && !subscriptionData.expires_at;
        
        if (isTrialActive && trialEndDate) {
          const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setDaysLeftInTrial(Math.max(0, daysLeft));
        }
        
        setIsTrialExpired(!!trialExpired);
        
        const tier = subscriptionData.subscription_tier as SubscriptionTier;
        const currentSubscription: Subscription = {
          ...subscriptionFeatures[tier],
          active: subscriptionData.active && !trialExpired,
          isTrialActive,
          trialEndsAt: subscriptionData.trial_ends_at,
          expiresAt: subscriptionData.expires_at
        };
        
        console.log('🔍 [SubscriptionContext] Subscription loaded:', {
          tier,
          active: currentSubscription.active,
          isTrialActive,
          trialExpired,
          leadLimit: currentSubscription.leadLimit,
          carLimit: currentSubscription.carLimit,
          subscription: currentSubscription
        });
        
        setSubscription(currentSubscription);
      }
    } catch (err) {
      console.error("🔍 [SubscriptionContext] Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      
      // במקרה של שגיאה, נגדיר מנוי פרימיום כברירת מחדל (ניסיון)
      const fallbackSub: Subscription = {
        ...subscriptionFeatures.premium,
        isTrialActive: true,
        active: true
      };
      console.log('🔍 [SubscriptionContext] Setting fallback premium subscription:', {
        tier: fallbackSub.tier,
        leadLimit: fallbackSub.leadLimit,
        carLimit: fallbackSub.carLimit
      });
      setSubscription(fallbackSub);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkEntitlement = (feature: keyof Subscription, value?: number): boolean => {
    console.log('🔍 [SubscriptionContext] checkEntitlement called:', {
      feature,
      value,
      subscriptionTier: subscription.tier,
      subscriptionActive: subscription.active,
      isTrialExpired,
      subscription: subscription,
      timestamp: new Date().toISOString()
    });
    
    if (!subscription) {
      console.log('🔍 [SubscriptionContext] No subscription found, denying access');
      return false;
    }
    
    // אם הניסיון פג ולא שילם - חסום הכל
    if (isTrialExpired) {
      console.log('🔍 [SubscriptionContext] Trial expired, denying access');
      return false;
    }
    
    const limit = subscription[feature];
    
    console.log('🔍 [SubscriptionContext] Checking entitlement details:', { 
      feature, 
      limit, 
      value,
      limitType: typeof limit,
      subscriptionObject: subscription
    });
    
    if (typeof limit === 'boolean') {
      console.log('🔍 [SubscriptionContext] Boolean limit result:', limit);
      return limit;
    }
    
    if (limit === Infinity) {
      console.log('🔍 [SubscriptionContext] Infinite limit, allowing');
      return true;
    }
    
    if (typeof limit === 'number' && typeof value === 'number') {
      // בדיקה נכונה: האם הערך החדש (value) קטן או שווה למגבלה
      const result = value <= limit;
      console.log('🔍 [SubscriptionContext] Numeric entitlement check:', { 
        limit, 
        value, 
        result, 
        calculation: `${value} <= ${limit} = ${result}`,
        explanation: 'Checking if the new total (including the item to be added) is within the limit'
      });
      return result;
    }
    
    const result = !!limit;
    console.log('🔍 [SubscriptionContext] Generic entitlement check result:', result);
    return result;
  };
  
  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const contextValue = { 
    subscription, 
    isLoading, 
    error, 
    checkEntitlement,
    refreshSubscription,
    daysLeftInTrial,
    isTrialExpired
  };

  console.log('🔍 [SubscriptionContext] Context value being provided:', {
    subscriptionTier: subscription.tier,
    leadLimit: subscription.leadLimit,
    carLimit: subscription.carLimit,
    isLoading,
    isTrialExpired,
    active: subscription.active
  });

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  return context;
}
