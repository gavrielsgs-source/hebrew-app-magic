import { GROW_API_BASE, GROW_USER_ID, GROW_PAGE_CODE, SUCCESS_URL, CANCEL_URL, NOTIFY_URL } from './config.ts';

export interface GrowPaymentRequest {
  fullName: string;
  phone: string;
  sum?: string;
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
  console.log(Deno.env.get('SUPABASE_URL'))
  formData.append('pageCode', GROW_PAGE_CODE);
  formData.append('userId', GROW_USER_ID);
  formData.append('successUrl', SUCCESS_URL)
  formData.append('cancelUrl', CANCEL_URL)
  formData.append('notifyUrl', NOTIFY_URL)
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

  //you must not send back the process id and process token back to the client
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
