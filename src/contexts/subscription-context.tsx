
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching subscription for user:", user.id);
      
      // Check if user is a super admin via admin_emails table
      const { data: isAdminData } = await supabase.rpc('is_admin');
      
      if (isAdminData) {
        console.log("Super Admin detected, granting unlimited access");
        const superAdminSubscription: Subscription = {
          tier: 'enterprise',
          active: true,
          carLimit: Infinity,
          leadLimit: Infinity,
          userLimit: Infinity,
          templateLimit: Infinity,
          whatsappMessageLimit: Infinity,
          taskLimit: Infinity,
          analyticsLevel: 'custom'
        };
        setSubscription(superAdminSubscription);
        setDaysLeftInTrial(0);
        setIsTrialExpired(false);
        return;
      }

      // First try to get subscription via company ownership
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      let subscriptionData = null;

      if (companyData) {
        // User is a company owner, get company subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('company_id', companyData.id)
          .single();

        if (!error && data) {
          subscriptionData = data;
        }
      }

      // Fallback to user-based subscription (legacy)
      if (!subscriptionData) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          subscriptionData = data;
        }
      }

      // If still no subscription, check if user belongs to a company
      if (!subscriptionData) {
        const { data: userRoleData } = await supabase
          .from('user_roles')
          .select('company_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (userRoleData && userRoleData.company_id) {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('company_id', userRoleData.company_id)
            .single();

          if (!error && data) {
            subscriptionData = data;
          }
        }
      }

      console.log("Subscription data received:", subscriptionData);
      
      if (!subscriptionData) {
        console.log("No subscription data, using default premium trial");
        const defaultSubscription: Subscription = {
          tier: 'premium',
          active: true,
          isTrialActive: true,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          ...subscriptionFeatures.premium
        };
        setSubscription(defaultSubscription);
        calculateTrialDays(defaultSubscription.trialEndsAt);
        return;
      }

      // Build subscription object from database data
      const tier = subscriptionData.subscription_tier as SubscriptionTier;
      const baseSubscription = subscriptionFeatures[tier] || subscriptionFeatures.premium;
      
      const subscription: Subscription = {
        ...baseSubscription,
        tier,
        active: subscriptionData.active,
        expiresAt: subscriptionData.expires_at,
        trialEndsAt: subscriptionData.trial_ends_at,
        isTrialActive: subscriptionData.trial_ends_at ? new Date(subscriptionData.trial_ends_at) > new Date() : false,
        // Override user limit with database value if available
        userLimit: subscriptionData.max_users || baseSubscription.userLimit
      };
      
      console.log("Final subscription object:", subscription);
      setSubscription(subscription);
      
      // Calculate trial days
      if (subscription.trialEndsAt) {
        calculateTrialDays(subscription.trialEndsAt);
      } else {
        setDaysLeftInTrial(null);
        setIsTrialExpired(false);
      }
      
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const calculateTrialDays = (trialEndsAt?: string) => {
    if (!trialEndsAt) {
      setDaysLeftInTrial(0);
      setIsTrialExpired(false);
      return;
    }

    const trialEnd = new Date(trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setDaysLeftInTrial(0);
      setIsTrialExpired(true);
    } else {
      setDaysLeftInTrial(diffDays);
      setIsTrialExpired(false);
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
    
    // Super Admin bypass - unlimited access for specific email
    if (user?.email === 'gavrielsgs@gmail.com') {
      console.log('🔍 [SubscriptionContext] Super Admin detected, granting unlimited access');
      return true;
    }
    
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
    active: subscription.active,
    daysLeftInTrial
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
