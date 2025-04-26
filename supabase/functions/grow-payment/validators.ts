
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
  
  // וידוא שסכום העסקה הוא חיובי
  if (payload.amount <= 0) {
    return 'Amount must be positive';
  }
  
  // וידוא מספר תשלומים תקף אם הוגדר
  if (payload.maxPayments && (isNaN(parseInt(payload.maxPayments)) || parseInt(payload.maxPayments) < 1)) {
    return 'Maximum payments must be at least 1';
  }

  return null;
}
