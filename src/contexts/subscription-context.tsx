
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
    if (!user) {
      setSubscription(subscriptionFeatures.premium);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('subscription_tier, active, expires_at, trial_ends_at')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError) {
        if (subscriptionError.code === 'PGRST116') {
          // אין מנוי עדיין, ניצור ניסיון חדש
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
            console.error("Error creating subscription:", insertError);
          }
          
          const newSubscription = { ...subscriptionFeatures.premium };
          newSubscription.isTrialActive = true;
          newSubscription.trialEndsAt = trialEndDate.toISOString();
          setSubscription(newSubscription);
          setDaysLeftInTrial(14);
          setIsTrialExpired(false);
          
          console.log('New subscription created:', newSubscription);
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
        const currentSubscription = { ...subscriptionFeatures[tier] };
        currentSubscription.active = subscriptionData.active && !trialExpired;
        currentSubscription.isTrialActive = isTrialActive;
        currentSubscription.trialEndsAt = subscriptionData.trial_ends_at;
        currentSubscription.expiresAt = subscriptionData.expires_at;
        
        setSubscription(currentSubscription);
        
        console.log('Subscription fetched:', {
          tier,
          active: currentSubscription.active,
          isTrialActive,
          trialExpired,
          subscription: currentSubscription
        });
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      setSubscription(subscriptionFeatures.premium);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkEntitlement = (feature: keyof Subscription, value?: number): boolean => {
    console.log('checkEntitlement called:', {
      feature,
      value,
      subscription,
      isTrialExpired,
      timestamp: new Date().toISOString()
    });
    
    if (!subscription) {
      console.log('No subscription found, denying access');
      return false;
    }
    
    // אם הניסיון פג ולא שילם - חסום הכל
    if (isTrialExpired) {
      console.log('Trial expired, denying access');
      return false;
    }
    
    const limit = subscription[feature];
    
    console.log('Checking limit:', { feature, limit, value });
    
    if (typeof limit === 'boolean') return limit;
    if (limit === Infinity) {
      console.log('Infinite limit, allowing');
      return true;
    }
    
    if (typeof limit === 'number' && typeof value === 'number') {
      const result = value <= limit;
      console.log('Numeric limit check:', { limit, value, result, allowed: result });
      return result;
    }
    
    const result = !!limit;
    console.log('Generic limit check result:', result);
    return result;
  };
  
  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        isLoading, 
        error, 
        checkEntitlement,
        refreshSubscription,
        daysLeftInTrial,
        isTrialExpired
      }}
    >
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
