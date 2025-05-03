
import { GROW_API_BASE } from './config.ts';

// Updated interface to match the exact parameters required by direct debit operations
export interface GrowPaymentRequest {
  userId: string;          // Required - Unique identifier for the business
  transactionToken: string; // Required - Transaction identifier token
  transactionId: string;    // Required - Transaction identifier number (must be a string)
  asmachta: string;        // Required - Approval from credit card company (must be a string)
  fullName?: string;       // Optional - Full name must consist of at least two names
  phone?: string;          // Optional - A valid Israeli mobile phone number
  email?: string;          // Optional - A valid email address
  chargeDay?: string;      // Optional - 1-31
  sum?: string;            // Optional - Total amount for payment (as string)
  paymentNum?: string;     // Optional - 1-48 (as string)
  changeStatus?: string;   // Optional
  updateCard?: string;     // Optional
  clientId: string;        // Authentication
  ECPwd: string;           // Authentication
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
  
  // Create a FormData object for multipart/form-data format
  const formData = new FormData();
  
  // Add all required fields to the form data
  formData.append('userId', payload.userId);
  formData.append('transactionToken', payload.transactionToken);
  formData.append('transactionId', payload.transactionId);
  formData.append('asmachta', payload.asmachta);
  formData.append('clientId', payload.clientId);
  formData.append('ECPwd', payload.ECPwd);
  
  // Add optional fields if they exist
  if (payload.fullName) formData.append('fullName', payload.fullName);
  if (payload.phone) formData.append('phone', payload.phone);
  if (payload.email) formData.append('email', payload.email);
  if (payload.chargeDay) formData.append('chargeDay', payload.chargeDay);
  if (payload.sum) formData.append('sum', payload.sum);
  if (payload.paymentNum) formData.append('paymentNum', payload.paymentNum);
  if (payload.changeStatus) formData.append('changeStatus', payload.changeStatus);
  if (payload.updateCard) formData.append('updateCard', payload.updateCard);

  console.log('Sending form data to GROW API:', Object.fromEntries(formData.entries()));

  // Send the request with the appropriate content type
  const response = await fetch(GROW_API_BASE, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GROW API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Alias for backward compatibility
export const createPaymentProcess = processDirectDebitPayment;
export const updateDirectDebitPayment = processDirectDebitPayment;
