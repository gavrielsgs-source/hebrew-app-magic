
export interface PaymentPayload {
  fullName?: string;
  phone?: string;
  email?: string;
  sum?: number | string;
  planId?: string;
  isTrial?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  companyName?: string;
  businessId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export function validatePayload(payload: PaymentPayload, action: string): string | null {
  if (!payload || typeof payload !== 'object') {
    return 'Invalid payload: must be an object';
  }

  if (action === 'createPaymentProcess' || action === 'updateDirectDebit') {
    if (!payload.fullName || typeof payload.fullName !== 'string' || payload.fullName.trim().length === 0) {
      return 'fullName is required and must be a non-empty string';
    }

    if (!payload.phone || typeof payload.phone !== 'string' || payload.phone.trim().length === 0) {
      return 'phone is required and must be a non-empty string';
    }

    if (!payload.email || typeof payload.email !== 'string' || !payload.email.includes('@')) {
      return 'email is required and must be a valid email address';
    }

    if (payload.sum !== undefined) {
      const sumValue = typeof payload.sum === 'string' ? parseFloat(payload.sum) : payload.sum;
      if (isNaN(sumValue) || sumValue <= 0) {
        return 'sum must be a positive number';
      }
    }

    if (payload.planId && typeof payload.planId !== 'string') {
      return 'planId must be a string';
    }

    if (payload.isTrial !== undefined && typeof payload.isTrial !== 'boolean') {
      return 'isTrial must be a boolean';
    }

    if (payload.billingCycle && !['monthly', 'yearly'].includes(payload.billingCycle)) {
      return 'billingCycle must be either monthly or yearly';
    }
  }

  return null;
}
