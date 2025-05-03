
export interface PaymentPayload {
  // Original fields
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  amount?: number;
  description?: string;
  successUrl?: string;
  errorUrl?: string;
  maxPayments?: string | number;
  language?: string;
  
  // Required fields for updateDirectDebit
  userId?: string;
  transactionToken?: string;
  transactionId?: string;
  asmachta?: string;
  
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
    // Validation for creating a new payment process
    if (!payload.customerName || !payload.customerPhone) {
      return 'Customer name and phone are required';
    }

    // Israeli phone number format validation
    if (!payload.customerPhone.match(/^05\d{8}$/)) {
      return 'Phone must be an Israeli mobile number';
    }

    // Full name validation
    if (!payload.customerName.includes(' ')) {
      return 'Name must include first and last name';
    }
    
    // Positive amount validation
    if (payload.amount !== undefined && payload.amount <= 0) {
      return 'Amount must be positive';
    }
  } 
  else if (action === 'updateDirectDebit') {
    // Validation for updating direct debit - check for all required fields from Postman image
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
