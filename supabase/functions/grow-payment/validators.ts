
export interface PaymentPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amount: number;
  description?: string;
  successUrl?: string;
  errorUrl?: string;
  maxPayments?: string;
  language?: string;
}

export function validatePayload(payload: PaymentPayload): string | null {
  if (!payload) {
    return 'Missing payload';
  }

  if (!payload.customerName || !payload.customerPhone) {
    return 'Customer name and phone are required';
  }

  // וידוא פורמט מספר טלפון ישראלי
  if (!payload.customerPhone.match(/^05\d{8}$/)) {
    return 'Phone must be an Israeli mobile number';
  }

  // וידוא שם מלא
  if (!payload.customerName.includes(' ')) {
    return 'Name must include first and last name';
  }

  return null;
}

