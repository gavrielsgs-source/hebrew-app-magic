
export type SubscriptionTier = 'premium' | 'business' | 'enterprise';

export interface Subscription {
  tier: SubscriptionTier;
  active: boolean;
  expiresAt?: string;
  trialEndsAt?: string;
  isTrialActive?: boolean;
  carLimit?: number;
  leadLimit?: number;
  userLimit?: number;
  templateLimit?: number;
  whatsappMessageLimit?: number;
  taskLimit?: number;
  companyLimit?: number;
  analyticsLevel?: 'basic' | 'full' | 'custom';
}

export const subscriptionFeatures: Record<SubscriptionTier, Subscription> = {
  premium: {
    tier: 'premium',
    active: true,
    carLimit: 20,
    leadLimit: 50,
    userLimit: 2,
    templateLimit: 5,
    whatsappMessageLimit: 100,
    taskLimit: Infinity,
    companyLimit: 3,
    analyticsLevel: 'basic'
  },
  business: {
    tier: 'business',
    active: true,
    carLimit: 50,
    leadLimit: 200,
    userLimit: 5,
    templateLimit: 10,
    whatsappMessageLimit: 500,
    taskLimit: Infinity,
    companyLimit: 10,
    analyticsLevel: 'full'
  },
  enterprise: {
    tier: 'enterprise',
    active: true,
    carLimit: Infinity,
    leadLimit: Infinity,
    userLimit: 10,
    templateLimit: Infinity,
    whatsappMessageLimit: 2000,
    taskLimit: Infinity,
    companyLimit: Infinity,
    analyticsLevel: 'custom'
  }
};
