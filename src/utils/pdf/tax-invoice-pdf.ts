import { generatePDF, wrapInHTMLDocument, formatCurrency, formatDate } from '../pdf-helper';
import type { TaxInvoiceData } from '@/types/tax-invoice';
import { getCompanyTypeBadgeHTML, getCompanyTypeFooter } from '../company-type-utils';

function createTaxInvoiceHTML(data: TaxInvoiceData): string {
  const itemsRows = data.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice, data.currency)}</td>
      <td>${item.vatRate}%</td>
      <td>${formatCurrency(item.total, data.currency)}</td>
    </tr>
  `).join('');

  const body = `
    <div class="doc-header">
      <div>
        <div class="doc-title">חשבונית מס</div>
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

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>תיאור</th>
          <th>כמות</th>
          <th>מחיר יחידה</th>
          <th>מע"מ</th>
          <th>סה"כ</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row"><span>סה"כ לפני מע"מ:</span><span>${formatCurrency(data.subtotal, data.currency)}</span></div>
      <div class="summary-row"><span>מע"מ:</span><span>${formatCurrency(data.vatAmount, data.currency)}</span></div>
      <div class="summary-row summary-total"><span>סה"כ לתשלום:</span><span>${formatCurrency(data.totalAmount, data.currency)}</span></div>
    </div>

    ${data.paymentTerms ? `
    <div class="notes-box">
      <div class="notes-title">תנאי תשלום</div>
      <div>${data.paymentTerms}</div>
    </div>
    ` : ''}

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

export async function generateTaxInvoicePDF(data: TaxInvoiceData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createTaxInvoiceHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `חשבונית-מס-${data.invoiceNumber}.pdf`,
    returnBlob,
  });
}
