import html2pdf from 'html2pdf.js';
import type { PriceQuoteData } from '@/types/document-production';

export async function generatePriceQuotePDF(data: PriceQuoteData): Promise<void> {
  const element = document.createElement('div');
  element.innerHTML = createPriceQuotePDFHTML(data);
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
    filename: `price-quote-${data.quoteNumber}.pdf`,
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
    await html2pdf().set(options).from(element).save();
  } finally {
    document.body.removeChild(element);
  }
}

function createPriceQuotePDFHTML(data: PriceQuoteData): string {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; font-size: 14px; line-height: 1.6;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #333;">הצעת מחיר</h1>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
          <div style="font-size: 16px;">
            <strong>מספר הצעה: ${data.quoteNumber}</strong>
          </div>
          <div style="font-size: 16px;">
            <strong>תאריך: ${new Date(data.date).toLocaleDateString('he-IL')}</strong>
          </div>
        </div>
        ${data.validUntil ? `
          <div style="margin-top: 10px; font-size: 14px; color: #666;">
            תוקף עד: ${new Date(data.validUntil).toLocaleDateString('he-IL')}
          </div>
        ` : ''}
      </div>

      <!-- Customer Info -->
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 5px;">פרטי הלקוח</h3>
        <div style="line-height: 1.8;">
          <div><strong>שם:</strong> ${data.customer.fullName}</div>
          ${data.customer.phone ? `<div><strong>טלפון:</strong> ${data.customer.phone}</div>` : ''}
          ${data.customer.email ? `<div><strong>אימייל:</strong> ${data.customer.email}</div>` : ''}
          ${data.customer.city ? `<div><strong>עיר:</strong> ${data.customer.city}</div>` : ''}
          ${data.customer.address ? `<div><strong>כתובת:</strong> ${data.customer.address}</div>` : ''}
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
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">הנחה</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">
                  ${item.description}
                  ${item.notes ? `<br><span style="font-size: 11px; color: #666;">${item.notes}</span>` : ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.unitPrice.toFixed(2)} ₪</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.discount ? item.discount.toFixed(2) + ' ₪' : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">${item.totalPrice.toFixed(2)} ₪</td>
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
              <span>סכום ביניים:</span>
              <span style="font-weight: bold;">${data.financial.subtotal.toFixed(2)} ₪</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>הנחה:</span>
              <span style="font-weight: bold;">${data.financial.totalDiscount.toFixed(2)} ₪</span>
            </div>
            ${data.includeVAT && data.financial.vat ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>מע״מ (18%):</span>
                <span style="font-weight: bold;">${data.financial.vat.toFixed(2)} ₪</span>
              </div>
            ` : ''}
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #2563eb;">
              <span>סה"כ לתשלום${data.includeVAT ? ' (כולל מע״מ)' : ' (ללא מע״מ)'}:</span>
              <span>${data.financial.total.toFixed(2)} ₪</span>
            </div>
          </div>
        </div>
      </div>

      ${data.terms ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-weight: bold; margin: 0 0 8px 0;">תנאים כלליים:</h4>
          <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.terms}</p>
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
        <p style="margin: 5px 0;">הצעת מחיר זו נוצרה במערכת ניהול חכמה לסוכנויות רכב</p>
        <p style="margin: 5px 0;">הצעה זו תקפה עד ${data.validUntil ? new Date(data.validUntil).toLocaleDateString('he-IL') : '______'}</p>
        <div style="margin-top: 40px;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #333; width: 150px; margin: 0 auto; padding-top: 5px;">
              <strong>חתימה ואישור</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
