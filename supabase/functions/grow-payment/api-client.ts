import { GROW_API_BASE, GROW_USER_ID, GROW_PAGE_CODE } from './config.ts';

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

  formData.append('pageCode', GROW_PAGE_CODE);
  formData.append('userId', GROW_USER_ID);

  if (payload.sum) formData.append('sum', payload.sum);
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

export const createPaymentProcess = processDirectDebitPayment;
export const updateDirectDebitPayment = processDirectDebitPayment;

export async function handler(req: Request): Promise<Response> {
  try {
    const { action, payload } = await req.json();

    if (!payload) {
      return new Response(JSON.stringify({ error: 'Missing payload' }), { status: 400 });
    }

    if (!payload.fullName || !payload.phone || !payload.sum) {
      return new Response(
        JSON.stringify({ error: 'Missing one or more required fields: fullName, phone, sum' }),
        { status: 400 }
      );
    }

    const paymentPayload: GrowPaymentRequest = {
      fullName: String(payload.fullName),
      phone: String(payload.phone),
      sum: String(payload.sum),
    };

    switch (action) {
      case 'createPaymentProcess':
        const createResult = await processDirectDebitPayment(paymentPayload);
        return new Response(JSON.stringify(createResult), { status: 200 });

      case 'updateDirectDebit':
     
        const updateResult = await processDirectDebitPayment(paymentPayload);
        return new Response(JSON.stringify(updateResult), { status: 200 });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }
  } catch (err) {
    console.error('Error in handler:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500 });
  }
}
