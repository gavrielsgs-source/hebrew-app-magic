import html2pdf from 'html2pdf.js';
import type { TaxInvoiceData } from '@/types/tax-invoice';

export async function generateTaxInvoicePDF(data: TaxInvoiceData, returnBlob?: boolean): Promise<void | Blob> {
  const element = document.createElement('div');
  element.innerHTML = createTaxInvoicePDFHTML(data);
  element.style.direction = 'rtl';
  element.style.width = '210mm';
  element.style.minHeight = '297mm';
  element.style.padding = '20mm';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.4';
  element.style.color = '#000';
  element.style.backgroundColor = '#fff';

  document.body.appendChild(element);

  const options = {
    margin: 0,
    filename: `tax-invoice-${data.invoiceNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const
    }
  };

  try {
    if (returnBlob) {
      const blob = await html2pdf().set(options).from(element).outputPdf('blob');
      return blob;
    } else {
      await html2pdf().set(options).from(element).save();
    }
  } finally {
    document.body.removeChild(element);
  }
}

function createTaxInvoicePDFHTML(data: TaxInvoiceData): string {
  const currencySymbol = data.currency === 'ILS' ? '₪' : '$';
  
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; font-size: 14px; line-height: 1.6;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #333;">${data.title}</h1>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
          <div style="font-size: 16px;">
            <strong>מספר חשבונית: ${data.invoiceNumber}</strong>
          </div>
          <div style="font-size: 16px;">
            <strong>תאריך: ${new Date(data.date).toLocaleDateString('he-IL')}</strong>
          </div>
        </div>
      </div>

      <!-- Company and Customer Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
        <!-- Company Info -->
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
          <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 5px;">פרטי המוכר</h3>
          <div style="line-height: 1.8;">
            <div><strong>שם החברה:</strong> ${data.company.name}</div>
            <div><strong>כתובת:</strong> ${data.company.address}</div>
            <div><strong>עוסק מורשה:</strong> ${data.company.hp}</div>
            <div><strong>טלפון:</strong> ${data.company.phone}</div>
            ${data.company.authorizedDealer ? '<div style="margin-top: 10px;"><span style="background: #f3f4f6; padding: 3px 8px; border-radius: 3px; font-size: 12px;">עוסק מורשה</span></div>' : ''}
          </div>
        </div>

        <!-- Customer Info -->
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
          <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 5px;">פרטי הקונה</h3>
          <div style="line-height: 1.8;">
            <div><strong>שם:</strong> ${data.customer.name}</div>
            <div><strong>כתובת:</strong> ${data.customer.address}</div>
            <div><strong>ח.פ / ת.ז:</strong> ${data.customer.hp}</div>
            <div><strong>טלפון:</strong> ${data.customer.phone}</div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #333;">פירוט הפריטים</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">#</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">תיאור</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">כמות</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">מחיר יחידה</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">מע"מ</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">אחוז מע"מ</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">סכום כולל</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.unitPrice.toFixed(2)} ${currencySymbol}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">
                  <span style="background-color: ${item.includeVat ? '#dcfce7' : '#f3f4f6'}; color: ${item.includeVat ? '#16a34a' : '#374151'}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                    ${item.includeVat ? 'עם מע"מ' : 'ללא מע"מ'}
                  </span>
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.includeVat ? item.vatRate + '%' : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">${item.total.toFixed(2)} ${currencySymbol}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Financial Summary -->
      <div style="margin-bottom: 30px;">
        <div style="max-width: 300px; margin-right: 0; margin-left: auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>סכום ללא מע"מ:</span>
              <span style="font-weight: bold;">${data.subtotal.toFixed(2)} ${currencySymbol}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>מע"מ:</span>
              <span style="font-weight: bold;">${data.vatAmount.toFixed(2)} ${currencySymbol}</span>
            </div>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #2563eb;">
              <span>סכום כולל לתשלום:</span>
              <span>${data.totalAmount.toFixed(2)} ${currencySymbol}</span>
            </div>
          </div>
        </div>
      </div>

      ${data.paymentTerms ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-weight: bold; margin: 0 0 8px 0;">תנאי תשלום:</h4>
          <p style="margin: 0; line-height: 1.6;">${data.paymentTerms}</p>
        </div>
      ` : ''}

      ${data.notes ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-weight: bold; margin: 0 0 8px 0;">הערות:</h4>
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${data.notes}</p>
        </div>
      ` : ''}

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <!-- Footer -->
      <div style="text-align: center; font-size: 11px; color: #666; line-height: 1.6;">
        <p style="margin: 5px 0;">חשבונית זו נוצרה במערכת ניהול חכמה לסוכנויות רכב</p>
        <p style="margin: 5px 0;">המסמך תקף עם חתימה וחותמת בלבד</p>
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #333; width: 150px; margin: 0 auto; padding-top: 5px;">
              <strong>חתימת המוכר</strong>
            </div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #333; width: 150px; margin: 0 auto; padding-top: 5px;">
              <strong>חתימת הקונה</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
