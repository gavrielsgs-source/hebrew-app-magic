import html2pdf from 'html2pdf.js';
import type { TaxInvoiceReceiptData } from '@/types/tax-invoice-receipt';

export async function generateTaxInvoiceReceiptPDF(data: TaxInvoiceReceiptData, returnBlob?: boolean): Promise<void | Blob> {
  const element = document.createElement('div');
  element.innerHTML = createTaxInvoiceReceiptPDFHTML(data);
  element.style.direction = 'rtl';
  element.style.width = '210mm';
  element.style.minHeight = '297mm';
  element.style.padding = '20mm';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.4';
  element.style.color = '#000';
  element.style.backgroundColor = '#fff';
  element.style.position = 'fixed';
  element.style.top = '0';
  element.style.left = '0';
  element.style.zIndex = '-9999';
  element.style.opacity = '0';

  document.body.appendChild(element);

  const opt = {
    margin: 10,
    filename: `חשבונית-מס-קבלה-${data.invoiceNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  try {
    if (returnBlob) {
      const blob = await html2pdf().set(opt).from(element).outputPdf('blob');
      return blob;
    } else {
      await html2pdf().set(opt).from(element).save();
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    document.body.removeChild(element);
  }
}

function createTaxInvoiceReceiptPDFHTML(data: TaxInvoiceReceiptData): string {
  const currencySymbol = data.currency === 'ILS' ? '₪' : '$';
  
  const paymentMethodNames: Record<string, string> = {
    cash: 'מזומן',
    check: 'המחאה',
    credit_card: 'כרטיס אשראי',
    bank_transfer: 'העברה בנקאית',
    other: 'אחר'
  };

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; direction: rtl; padding: 20px; background: white; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
        .header h1 { font-size: 28px; color: #4F46E5; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #666; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
        .info-box { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9fafb; }
        .info-box h3 { font-size: 16px; color: #4F46E5; margin-bottom: 10px; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .info-row span:first-child { font-weight: bold; color: #374151; }
        .info-row span:last-child { color: #6B7280; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
        .items-table th { background: #4F46E5; color: white; padding: 12px 8px; text-align: center; font-weight: bold; }
        .items-table td { border: 1px solid #ddd; padding: 10px 8px; text-align: center; }
        .items-table tbody tr:nth-child(even) { background: #f9fafb; }
        .summary { margin-top: 30px; display: flex; justify-content: flex-end; }
        .summary-box { border: 2px solid #4F46E5; padding: 20px; border-radius: 8px; min-width: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .summary-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid white; padding-top: 12px; margin-top: 12px; }
        .payments-section { margin: 30px 0; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .payments-section h3 { font-size: 16px; color: #4F46E5; margin-bottom: 15px; }
        .payment-item { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        .payment-item:last-child { border-bottom: none; }
        .notes { margin-top: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fffbeb; }
        .notes h3 { font-size: 14px; color: #92400e; margin-bottom: 10px; }
        .notes p { font-size: 12px; color: #78350f; line-height: 1.6; }
        .footer { margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #9CA3AF; }
      </style>
    </head>
    <body>
      <div class="header">
        ${data.company.logoUrl ? `
          <div style="margin-bottom: 15px;">
            <img src="${data.company.logoUrl}" alt="לוגו החברה" style="max-height: 60px; max-width: 180px; object-fit: contain;" />
          </div>
        ` : ''}
        <h1>${data.title}</h1>
        <p>מספר: ${data.invoiceNumber} | תאריך: ${new Date(data.date).toLocaleDateString('he-IL')}</p>
        <p>סוג: ${data.type === 'primary' ? 'ראשוני' : 'משני'} | מטבע: ${data.currency}</p>
      </div>

      <div class="info-section">
        <div class="info-box">
          <h3>פרטי החברה</h3>
          <div class="info-row"><span>שם:</span><span>${data.company.name}</span></div>
          <div class="info-row"><span>כתובת:</span><span>${data.company.address}</span></div>
          <div class="info-row"><span>ח.פ:</span><span>${data.company.hp}</span></div>
          <div class="info-row"><span>טלפון:</span><span>${data.company.phone}</span></div>
        </div>

        <div class="info-box">
          <h3>פרטי הלקוח</h3>
          <div class="info-row"><span>שם:</span><span>${data.customer.name}</span></div>
          <div class="info-row"><span>כתובת:</span><span>${data.customer.address}</span></div>
          <div class="info-row"><span>ח.פ/ת.ז:</span><span>${data.customer.hp}</span></div>
          <div class="info-row"><span>טלפון:</span><span>${data.customer.phone}</span></div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>מק"ט</th>
            <th>תיאור</th>
            <th>מחיר</th>
            <th>ללא מע"מ</th>
            <th>כמות</th>
            <th>מחיר ללא מע"מ</th>
            <th>הנחה</th>
            <th>סה"כ</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.description}</td>
              <td>${item.unitPrice.toFixed(2)} ${currencySymbol}</td>
              <td>${item.includeVat ? 'לא' : 'כן'}</td>
              <td>${item.quantity}</td>
              <td>${(item.unitPrice * item.quantity).toFixed(2)} ${currencySymbol}</td>
              <td>${item.discount.toFixed(2)} ${currencySymbol}</td>
              <td>${item.total.toFixed(2)} ${currencySymbol}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${data.payments && data.payments.length > 0 ? `
        <div class="payments-section">
          <h3>אמצעי תשלום</h3>
          ${data.payments.map(payment => `
            <div class="payment-item">
              <span>${paymentMethodNames[payment.type]}</span>
              <span>${payment.amount.toFixed(2)} ${currencySymbol}</span>
              <span>${new Date(payment.date).toLocaleDateString('he-IL')}</span>
              ${payment.reference ? `<span>${payment.reference}</span>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="summary">
        <div class="summary-box">
          <div class="summary-row">
            <span>סה"כ לפני מע"מ:</span>
            <span>${data.subtotal.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="summary-row">
            <span>סה"כ פריטים ללא מע"מ:</span>
            <span>${data.itemsWithoutVat.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="summary-row">
            <span>הנחה כללית:</span>
            <span>${data.generalDiscount.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="summary-row">
            <span>סכום אחרי הנחה:</span>
            <span>${data.amountAfterDiscount.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="summary-row">
            <span>סה"כ מע"מ (17%):</span>
            <span>${data.vatAmount.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="summary-row total">
            <span>סה"כ:</span>
            <span>${data.totalAmount.toFixed(2)} ${currencySymbol}</span>
          </div>
        </div>
      </div>

      ${data.notes ? `
        <div class="notes">
          <h3>הערות</h3>
          <p>${data.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>מסמך זה נוצר באמצעות מערכת CARSLEAD</p>
        <p>${data.lastPaymentDate ? `תאריך אחרון לתשלום: ${new Date(data.lastPaymentDate).toLocaleDateString('he-IL')}` : ''}</p>
      </div>
    </body>
    </html>
  `;
}
