
import { GROW_API_BASE, GROW_USER_ID, GROW_PAGE_CODE } from './config.ts';

// Updated interface to match the exact parameters required by direct debit operations
export interface GrowPaymentRequest {       // Required - Approval from credit card company (must be a string)
  fullName: string;       // Optional - Full name must consist of at least two names
  phone: string;          // Optional - A valid Israeli mobile phone number      // Optional - A valid email address   // Optional - 1-31
  sum?: string;            // Optional - Total amount for payment (as string)  // Optional - 1-48 (as string)/ Optional    // Authentication        // Authentication
}

export interface GrowPaymentResponse {
  status: number;
  err?: {
    id: number;
    message: string;
  };
  data?: {
    url?: string;
    processId?: string;
    transactionId?: string;
    asmachta?: string;
  };
}

// Single function for making direct debit requests - used for both initial payment and updates
export async function processDirectDebitPayment(payload: GrowPaymentRequest): Promise<GrowPaymentResponse> {
  console.log('Processing direct debit payment with payload:', payload);

  const formData = new FormData();

  formData.append('pageCode', GROW_PAGE_CODE);
  formData.append('userId', GROW_USER_ID);

  formData.append('sum', payload.sum); 
  formData.append('pageField[fullName]', payload.fullName);
  formData.append('pageField[phone]', payload.phone);

  console.log('Sending form data to GROW API:', Object.fromEntries(formData.entries()));

  const response = await fetch(`${GROW_API_BASE}/createPaymentProcess`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GROW API error: ${response.status} - ${errorText}`);
  }

  const response_json = await response.json();
  return response_json;
}


// Alias for backward compatibility
export const createPaymentProcess = processDirectDebitPayment;
export const updateDirectDebitPayment = processDirectDebitPayment;
