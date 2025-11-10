import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceRequest {
  userId: string;
  subscriptionId: string;
  amount: number;
  planName: string;
  billingCycle: string;
  paymentDetails: {
    transactionId: string;
    paymentDate: string;
  };
  billingDetails: {
    fullName: string;
    companyName?: string;
    businessId?: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      userId,
      subscriptionId,
      amount,
      planName,
      billingCycle,
      paymentDetails,
      billingDetails,
    }: InvoiceRequest = await req.json();

    console.log('Generating invoice for user:', userId);

    // Get next invoice number using the existing function
    const { data: docNumberData, error: docNumberError } = await supabase.functions.invoke(
      'get-next-document-number',
      {
        body: {
          documentType: 'invoice',
          prefix: 'INV-',
        },
        headers: {
          authorization: req.headers.get('authorization') || '',
        },
      }
    );

    if (docNumberError) {
      throw new Error(`Failed to generate invoice number: ${docNumberError.message}`);
    }

    const invoiceNumber = docNumberData.documentNumber;
    const invoiceDate = new Date().toISOString();

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml({
      invoiceNumber,
      invoiceDate,
      billingDetails,
      amount,
      planName,
      billingCycle,
      paymentDetails,
    });

    // Save invoice HTML to storage
    const fileName = `invoice-${invoiceNumber}-${Date.now()}.html`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`invoices/${userId}/${fileName}`, invoiceHtml, {
        contentType: 'text/html',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading invoice:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(`invoices/${userId}/${fileName}`);

    const invoiceUrl = urlData.publicUrl;

    // Save invoice record to database
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        amount: amount,
        currency: 'ILS',
        billing_details: billingDetails,
        payment_details: paymentDetails,
        status: 'paid',
        pdf_url: invoiceUrl,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error saving invoice record:', invoiceError);
      throw invoiceError;
    }

    console.log('✅ Invoice generated successfully:', invoiceNumber);

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          id: invoiceData.id,
          invoiceNumber,
          invoiceUrl,
          amount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateInvoiceHtml(data: {
  invoiceNumber: string;
  invoiceDate: string;
  billingDetails: any;
  amount: number;
  planName: string;
  billingCycle: string;
  paymentDetails: any;
}): string {
  const formattedDate = new Date(data.invoiceDate).toLocaleDateString('he-IL');
  const formattedAmount = data.amount.toFixed(2);
  const vat = (data.amount * 0.17).toFixed(2);
  const subtotal = (data.amount - parseFloat(vat)).toFixed(2);

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>חשבונית ${data.invoiceNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #2F3C7E; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2F3C7E; margin: 0; font-size: 32px; }
    .header .invoice-number { color: #666; font-size: 18px; margin-top: 10px; }
    .company-info { margin-bottom: 30px; }
    .company-info h3 { color: #2F3C7E; margin: 0 0 10px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    .info-box h4 { color: #2F3C7E; margin: 0 0 10px 0; font-size: 16px; }
    .info-box p { margin: 5px 0; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #2F3C7E; color: white; padding: 12px; text-align: right; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total-section { text-align: left; margin-top: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.final { font-size: 20px; font-weight: bold; color: #4CAF50; border-top: 2px solid #ddd; padding-top: 12px; margin-top: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>חשבונית מס / קבלה</h1>
      <div class="invoice-number">מספר חשבונית: ${data.invoiceNumber}</div>
      <div class="invoice-number">תאריך: ${formattedDate}</div>
    </div>

    <div class="company-info">
      <h3>CarsLeadApp</h3>
      <p>מערכת ניהול לידים לסוכני רכב</p>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h4>נמסר ל:</h4>
        <p><strong>${data.billingDetails.fullName}</strong></p>
        ${data.billingDetails.companyName ? `<p>חברה: ${data.billingDetails.companyName}</p>` : ''}
        ${data.billingDetails.businessId ? `<p>ח.פ/ע.מ: ${data.billingDetails.businessId}</p>` : ''}
        <p>אימייל: ${data.billingDetails.email}</p>
        <p>טלפון: ${data.billingDetails.phone}</p>
        ${data.billingDetails.address ? `<p>${data.billingDetails.address}</p>` : ''}
        ${data.billingDetails.city && data.billingDetails.postalCode ? `<p>${data.billingDetails.city}, ${data.billingDetails.postalCode}</p>` : ''}
      </div>

      <div class="info-box">
        <h4>פרטי תשלום:</h4>
        <p>מספר עסקה: ${data.paymentDetails.transactionId}</p>
        <p>תאריך תשלום: ${new Date(data.paymentDetails.paymentDate).toLocaleDateString('he-IL')}</p>
        <p>אמצעי תשלום: כרטיס אשראי</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>תיאור</th>
          <th style="text-align: center;">כמות</th>
          <th style="text-align: left;">מחיר</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>חבילת ${data.planName}</strong><br>
            <small>מנוי ${data.billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}</small>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: left;">₪${subtotal}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span>סכום ביניים:</span>
        <span>₪${subtotal}</span>
      </div>
      <div class="total-row">
        <span>מע"מ (17%):</span>
        <span>₪${vat}</span>
      </div>
      <div class="total-row final">
        <span>סה"כ לתשלום:</span>
        <span>₪${formattedAmount}</span>
      </div>
    </div>

    <div class="footer">
      <p>תודה שבחרת ב-CarsLeadApp!</p>
      <p>לשאלות ותמיכה: support@carsleadapp.com</p>
    </div>
  </div>
</body>
</html>`;
}
