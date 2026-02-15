import { generatePDF, wrapInHTMLDocument, formatCurrency } from '../pdf-helper';
import type { PriceQuoteData } from '@/types/document-production';

function createPriceQuoteHTML(data: PriceQuoteData): string {
  const itemsRows = data.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
      <td>${formatCurrency(item.totalPrice)}</td>
    </tr>
  `).join('');

  const validDate = data.validUntil ? new Date(data.validUntil).toLocaleDateString('he-IL') : '';

  const body = `
    <div class="doc-header">
      <div>
        <div class="doc-title">הצעת מחיר</div>
        <div class="doc-subtitle">מספר: ${data.quoteNumber} | תאריך: ${new Date(data.date).toLocaleDateString('he-IL')}</div>
        ${validDate ? `<div class="doc-subtitle">תוקף עד: ${validDate}</div>` : ''}
      </div>
      <div class="logo-area">
        ${data.company?.logoUrl ? `<img src="${data.company.logoUrl}" alt="logo" />` : 
          data.company?.name ? `<div style="font-size:18px;font-weight:bold;color:#1a365d">${data.company.name}</div>` : ''}
      </div>
    </div>

    ${data.company ? `
    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">פרטי החברה</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.company.name}</span></div>
        ${data.company.hp ? `<div class="info-row"><span class="info-label">ח.פ:</span><span class="info-value">${data.company.hp}</span></div>` : ''}
        ${data.company.phone ? `<div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.company.phone}</span></div>` : ''}
        ${data.company.address ? `<div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.company.address}</span></div>` : ''}
      </div>
      <div class="info-box">
        <div class="info-box-title">פרטי הלקוח</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.customer.fullName}</span></div>
        ${data.customer.phone ? `<div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.customer.phone}</span></div>` : ''}
        ${data.customer.email ? `<div class="info-row"><span class="info-label">אימייל:</span><span class="info-value">${data.customer.email}</span></div>` : ''}
        <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.customer.address}, ${data.customer.city}</span></div>
      </div>
    </div>
    ` : `
    <div class="info-box" style="margin-bottom:15px">
      <div class="info-box-title">פרטי הלקוח</div>
      <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.customer.fullName}</span></div>
      ${data.customer.phone ? `<div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.customer.phone}</span></div>` : ''}
      <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.customer.address}, ${data.customer.city}</span></div>
    </div>
    `}

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>תיאור</th>
          <th>כמות</th>
          <th>מחיר יחידה</th>
          <th>הנחה</th>
          <th>סה"כ</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row"><span>סה"כ לפני הנחה:</span><span>${formatCurrency(data.financial.subtotal)}</span></div>
      ${data.financial.totalDiscount > 0 ? `<div class="summary-row" style="color:#c53030"><span>הנחה:</span><span>-${formatCurrency(data.financial.totalDiscount)}</span></div>` : ''}
      ${data.financial.vat !== undefined && data.financial.vat > 0 ? `<div class="summary-row"><span>מע"מ (18%):</span><span>${formatCurrency(data.financial.vat)}</span></div>` : ''}
      <div class="summary-row summary-total"><span>סה"כ לתשלום:</span><span>${formatCurrency(data.financial.total)}</span></div>
    </div>

    ${data.terms ? `
    <div class="notes-box">
      <div class="notes-title">תנאים</div>
      <div>${data.terms}</div>
    </div>
    ` : ''}

    ${data.notes ? `
    <div class="notes-box">
      <div class="notes-title">הערות</div>
      <div>${data.notes}</div>
    </div>
    ` : ''}

    <div class="footer">
      הצעת מחיר זו בתוקף עד ${validDate} | מסמך זה הופק באופן אוטומטי
    </div>
  `;
  return wrapInHTMLDocument(body);
}

export async function generatePriceQuotePDF(data: PriceQuoteData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createPriceQuoteHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `הצעת-מחיר-${data.quoteNumber}.pdf`,
    returnBlob,
  });
}
