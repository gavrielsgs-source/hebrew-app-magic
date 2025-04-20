
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subscription, SubscriptionTier, subscriptionFeatures } from '@/types/subscription';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call a Supabase function to verify subscription with Stripe
      // For now, we'll simulate with a mock subscription tier lookup
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const tier = (data?.subscription_tier as SubscriptionTier) || 'free';
      setSubscription(subscriptionFeatures[tier]);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching subscription'));
      // Fallback to free tier on error
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
