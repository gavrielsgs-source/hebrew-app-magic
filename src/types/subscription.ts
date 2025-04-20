
export type SubscriptionTier = 'free' | 'premium' | 'business' | 'enterprise';

export interface Subscription {
  tier: SubscriptionTier;
  active: boolean;
  expiresAt?: string;
  carLimit?: number;
  leadLimit?: number;
  userLimit?: number;
  templateLimit?: number;
}

export const subscriptionFeatures: Record<SubscriptionTier, Subscription> = {
  free: {
    tier: 'free',
    active: true,
    carLimit: 5,
    leadLimit: 10,
    userLimit: 1,
    templateLimit: 1
  },
  premium: {
    tier: 'premium',
    active: true,
    carLimit: 20,
    leadLimit: 50,
    userLimit: 2,
    templateLimit: 3
  },
  business: {
    tier: 'business',
    active: true,
    carLimit: 50,
    leadLimit: 200,
    userLimit: 5,
    templateLimit: 5
  },
  enterprise: {
    tier: 'enterprise',
    active: true,
    carLimit: Infinity,
    leadLimit: Infinity,
    userLimit: 10,
    templateLimit: Infinity
  }
};
