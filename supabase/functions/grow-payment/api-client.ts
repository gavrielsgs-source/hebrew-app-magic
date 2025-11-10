
import { GROW_API_BASE, GROW_USER_ID, GROW_PAGE_CODE, SUCCESS_URL, CANCEL_URL, NOTIFY_URL } from './config.ts';

export interface GrowPaymentRequest {
  fullName: string;
  phone: string;
  email: string;
  sum?: string;
  planId?: string;
  isTrial?: boolean;
  billingCycle?: 'monthly' | 'yearly';
  companyName?: string;
  businessId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
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

export async function processDirectDebitPayment(payload: GrowPaymentRequest): Promise<GrowPaymentResponse> {
  console.log('Processing direct debit payment with payload:', payload);

  const formData = new FormData();

  formData.append('pageCode', GROW_PAGE_CODE);
  formData.append('userId', GROW_USER_ID);
  formData.append('successUrl', SUCCESS_URL);
  formData.append('cancelUrl', CANCEL_URL);
  formData.append('notifyUrl', NOTIFY_URL);
  
  // For trial: charge 1 ILS for verification, will be refunded
  const amount = payload.isTrial ? '1.00' : (payload.sum || '');
  formData.append('sum', amount);
  
  formData.append('pageField[fullName]', payload.fullName);
  formData.append('pageField[phone]', payload.phone);
  formData.append('pageField[email]', payload.email);
  
  // Add additional billing details if provided
  if (payload.companyName) {
    formData.append('pageField[companyName]', payload.companyName);
  }
  if (payload.businessId) {
    formData.append('pageField[businessId]', payload.businessId);
  }
  if (payload.address) {
    formData.append('pageField[address]', payload.address);
  }
  if (payload.city) {
    formData.append('pageField[city]', payload.city);
  }
  if (payload.postalCode) {
    formData.append('pageField[postalCode]', payload.postalCode);
  }
  
  // Add metadata for webhook processing
  if (payload.planId) {
    formData.append('pageField[planId]', payload.planId);
  }
  if (payload.isTrial !== undefined) {
    formData.append('pageField[isTrial]', String(payload.isTrial));
  }
  if (payload.billingCycle) {
    formData.append('pageField[billingCycle]', payload.billingCycle);
  }

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

  // Security: Remove sensitive data before sending to client
  if (
    response_json?.status === 1 &&
    typeof response_json.data === "object" &&
    response_json.data !== null
  ) {
    delete response_json.data.processId;
    delete response_json.data.processToken;
  }
  
  return response_json;
}

export const createPaymentProcess = processDirectDebitPayment;
export const updateDirectDebitPayment = processDirectDebitPayment;
