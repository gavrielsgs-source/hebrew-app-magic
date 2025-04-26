
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
  // המרת האובייקט לפורמט נכון עבור המערכת של GROW
  const formattedPayload = { ...payload };
  
  // ווידוא שיש לפחות תשלום אחד
  if (!formattedPayload.paymentNum || formattedPayload.paymentNum === "0") {
    formattedPayload.paymentNum = "1";
  }
  
  // המרה לפורמט של x-www-form-urlencoded
  const formBody = new URLSearchParams();
  
  // הוספת כל השדות בפורמט המתאים
  Object.entries(formattedPayload).forEach(([key, value]) => {
    // טיפול בשדות מקוננים כמו pageField
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== undefined) {
          formBody.append(`${key}.${nestedKey}`, String(nestedValue));
        }
      });
    } else if (value !== undefined) {
      formBody.append(key, String(value));
    }
  });

  console.log('Sending formatted payload to GROW:', Object.fromEntries(formBody));

  const response = await fetch(GROW_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: formBody.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GROW API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
