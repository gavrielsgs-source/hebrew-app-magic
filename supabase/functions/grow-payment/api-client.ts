import { GROW_API_BASE } from './config.ts';

// Updated interface to match the updateDirectDebit endpoint requirements
export interface GrowPaymentRequest {
  userId: string;          // Required - Unique identifier for the business
  transactionToken: string; // Required - Transaction identifier token
  transactionId: string;    // Required - Transaction identifier number
  asmachta: string;        // Required - Approval from credit card company
  clientId: string;        // Authentication
  ECPwd: string;           // Authentication
  pageField?: {            // Additional customer fields if needed
    fullName?: string;
    phone?: string;
    email?: string;
  };
  // Additional fields that might be needed based on documentation
  sum?: string;
  description?: string;
  paymentNum?: string;
  maxPaymentNum?: string;
  chargeType?: string;
  pageCode?: string;
  successUrl?: string;
  cancelUrl?: string;
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

export async function updateDirectDebitPayment(payload: GrowPaymentRequest): Promise<GrowPaymentResponse> {
  // Ensure all parameters are correctly formatted as strings
  const formattedPayload = { ...payload };
  
  // Convert numbers to strings if they aren't already
  if (formattedPayload.paymentNum && typeof formattedPayload.paymentNum !== 'string') {
    formattedPayload.paymentNum = String(formattedPayload.paymentNum);
  }
  
  if (formattedPayload.maxPaymentNum && typeof formattedPayload.maxPaymentNum !== 'string') {
    formattedPayload.maxPaymentNum = String(formattedPayload.maxPaymentNum);
  }
  
  if (formattedPayload.transactionId && typeof formattedPayload.transactionId !== 'string') {
    formattedPayload.transactionId = String(formattedPayload.transactionId);
  }
  
  if (formattedPayload.asmachta && typeof formattedPayload.asmachta !== 'string') {
    formattedPayload.asmachta = String(formattedPayload.asmachta);
  }
  
  // Use FormData for multipart/form-data format if required by the API
  const formData = new FormData();
  
  // Add all fields to the form data
  Object.entries(formattedPayload).forEach(([key, value]) => {
    // Handle nested objects like pageField
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== undefined) {
          formData.append(`${key}.${nestedKey}`, String(nestedValue));
        }
      });
    } else if (value !== undefined) {
      formData.append(key, String(value));
    }
  });

  console.log('Sending formatted payload to GROW updateDirectDebit:', Object.fromEntries(formData.entries()));

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

export async function createPaymentProcess(payload: GrowPaymentRequest): Promise<GrowPaymentResponse> {
  // המרת האובייקט לפורמט נכון עבור המערכת של GROW
  const formattedPayload = { ...payload };
  
  // ווידוא שיש לפחות תשלום אחד
  if (!formattedPayload.paymentNum || formattedPayload.paymentNum === "0") {
    formattedPayload.paymentNum = "1";
  }
  
  // וידוא שיש maxPaymentNum תקין
  if (!formattedPayload.maxPaymentNum) {
    formattedPayload.maxPaymentNum = "1"; // ברירת מחדל לתשלום אחד אם לא הוגדר
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
