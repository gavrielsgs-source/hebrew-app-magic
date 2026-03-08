import { generatePDF, wrapInHTMLDocument, formatCurrency, formatDate } from '../pdf-helper';
import type { TaxInvoiceReceiptData } from '@/types/tax-invoice-receipt';
import { getCompanyTypeBadgeHTML, getCompanyTypeFooter } from '../company-type-utils';

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  cash: 'מזומן',
  check: 'המחאה',
  credit_card: 'כרטיס אשראי',
  bank_transfer: 'העברה בנקאית',
  other: 'אחר',
};

function createTaxInvoiceReceiptHTML(data: TaxInvoiceReceiptData): string {
  const itemsRows = data.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice, data.currency)}</td>
      <td>${item.discount > 0 ? formatCurrency(item.discount, data.currency) : '-'}</td>
      <td>${item.includeVat ? `כולל ${item.vatRate}%` : `+ ${item.vatRate}%`}</td>
      <td>${formatCurrency(item.total, data.currency)}</td>
    </tr>
  `).join('');

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
        <div class="doc-title">חשבונית מס / קבלה</div>
        <div class="doc-subtitle">מספר: ${data.invoiceNumber} | תאריך: ${formatDate(data.date)}</div>
      </div>
      <div class="logo-area">
        <div style="font-size:18px;font-weight:bold;color:#1a365d">${data.company.name}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">פרטי העסק</div>
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

    <h3 style="color:#1a365d;font-size:15px;margin:15px 0 5px">פריטים</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>תיאור</th>
          <th>כמות</th>
          <th>מחיר יחידה</th>
          <th>הנחה</th>
          <th>מע"מ</th>
          <th>סה"כ</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    ${paymentsRows ? `
    <h3 style="color:#1a365d;font-size:15px;margin:15px 0 5px">אמצעי תשלום</h3>
    <table>
      <thead>
        <tr>
          <th>סוג</th>
          <th>אסמכתא</th>
          <th>תאריך</th>
          <th>סכום</th>
        </tr>
      </thead>
      <tbody>
        ${paymentsRows}
      </tbody>
    </table>
    ` : ''}

    <div class="summary-box">
      <div class="summary-row"><span>סה"כ פריטים:</span><span>${formatCurrency(data.subtotal, data.currency)}</span></div>
      ${data.generalDiscount > 0 ? `<div class="summary-row" style="color:#c53030"><span>הנחה כללית:</span><span>-${formatCurrency(data.generalDiscount, data.currency)}</span></div>` : ''}
      <div class="summary-row"><span>לאחר הנחה:</span><span>${formatCurrency(data.amountAfterDiscount, data.currency)}</span></div>
      <div class="summary-row"><span>מע"מ:</span><span>${formatCurrency(data.vatAmount, data.currency)}</span></div>
      <div class="summary-row summary-total"><span>סה"כ לתשלום:</span><span>${formatCurrency(data.totalAmount, data.currency)}</span></div>
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

export async function generateTaxInvoiceReceiptPDF(data: TaxInvoiceReceiptData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createTaxInvoiceReceiptHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `חשבונית-מס-קבלה-${data.invoiceNumber}.pdf`,
    returnBlob,
  });
}
