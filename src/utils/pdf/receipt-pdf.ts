import { generatePDF, wrapInHTMLDocument, formatCurrency, formatDate } from '../pdf-helper';
import type { ReceiptData } from '@/types/receipt';
import { getCompanyTypeBadgeHTML, getCompanyTypeFooter } from '../company-type-utils';

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: 'מזומן',
  check: 'המחאה',
  credit_card: 'כרטיס אשראי',
  bank_transfer: 'העברה בנקאית',
  other: 'אחר',
  tax_deduction: 'ניכוי מס במקור',
  vehicle: 'רכב',
};

function createReceiptHTML(data: ReceiptData): string {
  const paymentsRows = data.payments
    .filter(p => p.amount > 0)
    .map(p => `
      <tr>
        <td>${PAYMENT_TYPE_LABELS[p.type] || p.type}</td>
        <td>${p.reference || '-'}</td>
        <td>${formatDate(p.date)}</td>
        <td>${formatCurrency(p.amount, data.currency)}</td>
      </tr>
    `).join('');

  const body = `
    <div class="doc-header">
      <div>
        <div class="doc-title">קבלה</div>
        <div class="doc-subtitle">מספר: ${data.receiptNumber} | תאריך: ${formatDate(data.date)}</div>
      </div>
      <div class="logo-area">
        ${data.company.logoUrl ? `<img src="${data.company.logoUrl}" alt="logo" />` : 
          `<div style="font-size:18px;font-weight:bold;color:#1a365d">${data.company.name}</div>`}
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">פרטי החברה</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.company.name}</span></div>
        <div class="info-row"><span class="info-label">ח.פ:</span><span class="info-value">${data.company.hp}</span></div>
        <div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.company.phone}</span></div>
        <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.company.address}</span></div>
        ${getCompanyTypeBadgeHTML(data.company.companyType, data.company.authorizedDealer)}
      </div>
      <div class="info-box">
        <div class="info-box-title">פרטי הלקוח</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.customer.name}</span></div>
        <div class="info-row"><span class="info-label">ח.פ/ת.ז:</span><span class="info-value">${data.customer.hp}</span></div>
        <div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.customer.phone}</span></div>
        <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.customer.address}</span></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>סוג תשלום</th>
          <th>אסמכתא</th>
          <th>תאריך</th>
          <th>סכום</th>
        </tr>
      </thead>
      <tbody>
        ${paymentsRows}
      </tbody>
    </table>

    <div class="summary-box">
      ${data.totals.cash > 0 ? `<div class="summary-row"><span>מזומן:</span><span>${formatCurrency(data.totals.cash, data.currency)}</span></div>` : ''}
      ${data.totals.check > 0 ? `<div class="summary-row"><span>המחאות:</span><span>${formatCurrency(data.totals.check, data.currency)}</span></div>` : ''}
      ${data.totals.creditCard > 0 ? `<div class="summary-row"><span>כרטיסי אשראי:</span><span>${formatCurrency(data.totals.creditCard, data.currency)}</span></div>` : ''}
      ${data.totals.bankTransfer > 0 ? `<div class="summary-row"><span>העברות בנקאיות:</span><span>${formatCurrency(data.totals.bankTransfer, data.currency)}</span></div>` : ''}
      ${data.totals.vehicle > 0 ? `<div class="summary-row"><span>רכבים:</span><span>${formatCurrency(data.totals.vehicle, data.currency)}</span></div>` : ''}
      ${data.totals.other > 0 ? `<div class="summary-row"><span>אחר:</span><span>${formatCurrency(data.totals.other, data.currency)}</span></div>` : ''}
      <div class="summary-row summary-total"><span>סה"כ:</span><span>${formatCurrency(data.totals.grandTotal, data.currency)}</span></div>
      ${data.totals.taxDeduction > 0 ? `
        <div class="summary-row" style="color:#c53030"><span>ניכוי מס במקור:</span><span>${formatCurrency(data.totals.taxDeduction, data.currency)}</span></div>
        <div class="summary-row" style="font-weight:bold"><span>סה"כ כולל ניכוי:</span><span>${formatCurrency(data.totals.totalWithTaxDeduction, data.currency)}</span></div>
      ` : ''}
    </div>

    ${data.notes ? `
    <div class="notes-box">
      <div class="notes-title">הערות</div>
      <div>${data.notes}</div>
    </div>
    ` : ''}

    <div class="footer">
      מסמך זה הופק באופן אוטומטי | ${data.company.name}${getCompanyTypeFooter(data.company.companyType, data.company.authorizedDealer)}
    </div>
  `;
  return wrapInHTMLDocument(body);
}

export async function generateReceiptPDF(data: ReceiptData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createReceiptHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `קבלה-${data.receiptNumber}.pdf`,
    returnBlob,
  });
}
