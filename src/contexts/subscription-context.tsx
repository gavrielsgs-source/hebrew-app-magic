
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
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(subscriptionFeatures.free);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(subscriptionFeatures.free);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('subscription_tier, active, expires_at')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError) {
        if (subscriptionError.code === 'PGRST116') {
          // אין מנוי עדיין, ניצור אחד חדש
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              subscription_tier: 'free',
              active: true
            });
          
          if (insertError) {
            console.error("Error creating subscription:", insertError);
          }
          setSubscription(subscriptionFeatures.free);
        } else {
          throw subscriptionError;
        }
      } else {
        // בדיקה אם המנוי פעיל ולא פג
        const isActive = subscriptionData.active && 
          (!subscriptionData.expires_at || new Date(subscriptionData.expires_at) > new Date());
        
        const tier = isActive ? subscriptionData.subscription_tier as SubscriptionTier : 'free';
        setSubscription(subscriptionFeatures[tier] || subscriptionFeatures.free);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      // תמיד נחזור לרמה הבסיסית במקרה של שגיאה
      setSubscription(subscriptionFeatures.free);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkEntitlement = (feature: keyof Subscription, value?: number): boolean => {
    if (!subscription) return false;
    
    const limit = subscription[feature];
    
    // If the feature isn't a limit (like "active")
    if (typeof limit === 'boolean') return limit;
    
    // If the feature is unlimited (Infinity)
    if (limit === Infinity) return true;
    
    // If we're checking if we're under a limit
    if (typeof limit === 'number' && typeof value === 'number') {
      return value <= limit;
    }
    
    // If we're just checking if the feature exists
    return !!limit;
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
        refreshSubscription
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
