
export interface PaymentPayload {
  // Original fields
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  amount?: number;
  description?: string;
  successUrl?: string;
  errorUrl?: string;
  maxPayments?: string;
  language?: string;
  
  // New required fields for updateDirectDebit
  userId?: string;
  transactionToken?: string;
  transactionId?: string;
  asmachta?: string;
  action?: string; // To distinguish between create and update operations
}

export function validatePayload(payload: PaymentPayload, action: string = 'create'): string | null {
  if (!payload) {
    return 'Missing payload';
  }

  if (action === 'create') {
    // Validation for creating a new payment process
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
    if (payload.amount !== undefined && payload.amount <= 0) {
      return 'Amount must be positive';
    }
  } 
  else if (action === 'update') {
    // Validation for updating direct debit
    if (!payload.userId) {
      return 'userId is required for updating direct debit';
    }
    
    if (!payload.transactionToken) {
      return 'transactionToken is required for updating direct debit';
    }
    
    if (!payload.transactionId) {
      return 'transactionId is required for updating direct debit';
    }
    
    if (!payload.asmachta) {
      return 'asmachta is required for updating direct debit';
    }
  }
  
  // וידוא מספר תשלומים תקף אם הוגדר
  if (payload.maxPayments && (isNaN(parseInt(payload.maxPayments)) || parseInt(payload.maxPayments) < 1)) {
    return 'Maximum payments must be at least 1';
  }

  return null;
}
