
import { GROW_API_BASE } from './config.ts';

export interface GrowPaymentRequest {
  pageCode: string;
  userId: string;
  sum: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  pageField: {
    fullName: string;
    phone: string;
    email?: string;
  };
  chargeType: string;
  paymentNum: string;
  clientId: string;
  ECPwd: string;
}

export interface GrowPaymentResponse {
  status: number;
  err?: {
    id: number;
    message: string;
  };
  data?: {
    url: string;
    processId: string;
  };
}

export async function createPaymentProcess(payload: GrowPaymentRequest): Promise<GrowPaymentResponse> {
  const response = await fetch(GROW_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams(payload as unknown as Record<string, string>).toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GROW API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

