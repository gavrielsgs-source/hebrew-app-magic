
export interface PaymentPayload {
  // Direct debit required fields
  userId?: string;
  transactionToken?: string;
  transactionId?: string;
  asmachta?: string;
  sum?: number | string;
  
  // Optional user identity fields
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Optional payment configuration fields
  description?: string;
  successUrl?: string;
  errorUrl?: string;
  maxPayments?: string | number;
  language?: string;
  
  // Additional optional fields for updateDirectDebit
  chargeDay?: string;
  changeStatus?: string;
  updateCard?: string;
  
  action?: string; // To distinguish between create and update operations
}

export function validatePayload(payload: PaymentPayload, action: string = 'create'): string | null {
  if (!payload) {
    return 'Missing payload';
  }

  if (action === 'createPaymentProcess') {
    // For direct debit structure, validate required fields
    if (!payload.userId) {
      return 'userId is required for creating payment process';
    }
    
    if (!payload.transactionToken) {
      return 'transactionToken is required for creating payment process';
    }
    
    if (!payload.transactionId) {
      return 'transactionId is required for creating payment process';
    }
    
    if (!payload.asmachta) {
      return 'asmachta is required for creating payment process';
    }
    
    if (payload.sum === undefined) {
      return 'sum is required for creating payment process';
    }
    
    // Positive sum validation
    const sumValue = typeof payload.sum === 'string' ? parseFloat(payload.sum) : payload.sum;
    if (isNaN(sumValue) || sumValue <= 0) {
      return 'Sum must be a positive number';
    }
    
    // Additional identity validation if provided
    if (payload.customerPhone && !payload.customerPhone.match(/^05\d{8}$/)) {
      return 'Phone must be an Israeli mobile number';
    }

    if (payload.customerName && !payload.customerName.includes(' ')) {
      return 'Name must include first and last name';
    }
  } 
  else if (action === 'updateDirectDebit') {
    // Same validation as createPaymentProcess for direct debit fields
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
    
    // Charge day validation if provided
    if (payload.chargeDay && (isNaN(parseInt(payload.chargeDay)) || parseInt(payload.chargeDay) < 1 || parseInt(payload.chargeDay) > 31)) {
      return 'chargeDay must be between 1 and 31';
    }
  }
  
  // Payment number validation if provided
  if (payload.maxPayments) {
    const maxPaymentsNum = typeof payload.maxPayments === 'string' ? 
      parseInt(payload.maxPayments) : payload.maxPayments;
    
    if (isNaN(maxPaymentsNum) || maxPaymentsNum < 1) {
      return 'Maximum payments must be at least 1';
    }
  }

  return null;
}
