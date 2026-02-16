import { generatePDF, wrapInHTMLDocument, formatCurrency, formatDate } from '../pdf-helper';
import type { TaxInvoiceCreditData } from '@/types/tax-invoice-credit';
import { getCompanyTypeBadgeHTML, getCompanyTypeFooter } from '../company-type-utils';

function createTaxInvoiceCreditHTML(data: TaxInvoiceCreditData): string {
  const creditForLabel = data.creditForType === 'tax_invoice' ? 'חשבונית מס' : 'חשבונית מס קבלה';

  const body = `
    <div class="doc-header">
      <div>
        <div class="doc-title">חשבונית מס זיכוי</div>
        <div class="doc-subtitle">מספר: ${data.creditInvoiceNumber} | תאריך: ${formatDate(data.date)}</div>
      </div>
      <div class="logo-area">
        ${data.company.logoUrl ? `<img src="${data.company.logoUrl}" alt="logo" />` : 
          `<div style="font-size:18px;font-weight:bold;color:#1a365d">${data.company.name}</div>`}
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

    ${data.originalInvoice ? `
    <div class="info-box" style="margin-bottom:15px;border-color:#e53e3e">
      <div class="info-box-title" style="color:#c53030">זיכוי עבור ${creditForLabel}</div>
      <div class="info-row"><span class="info-label">מספר חשבונית:</span><span class="info-value">${data.originalInvoice.invoiceNumber}</span></div>
      <div class="info-row"><span class="info-label">תאריך:</span><span class="info-value">${formatDate(data.originalInvoice.date)}</span></div>
      <div class="info-row"><span class="info-label">סכום מקורי:</span><span class="info-value">${formatCurrency(data.originalInvoice.totalAmount)}</span></div>
    </div>
    ` : ''}

    ${data.allocationNumber ? `
    <div class="info-box" style="margin-bottom:15px">
      <div class="info-box-title">מספר הקצאה</div>
      <div class="info-row"><span class="info-label">מספר:</span><span class="info-value">${data.allocationNumber}</span></div>
    </div>
    ` : ''}

    <div class="summary-box">
      <div class="summary-row"><span>סכום זיכוי לפני מע"מ:</span><span>${formatCurrency(data.creditAmount)}</span></div>
      <div class="summary-row"><span>מע"מ:</span><span>${formatCurrency(data.vatAmount)}</span></div>
      <div class="summary-row summary-total" style="color:#c53030"><span>סה"כ זיכוי:</span><span>${formatCurrency(data.totalCreditAmount)}</span></div>
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

export async function generateTaxInvoiceCreditPDF(data: TaxInvoiceCreditData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createTaxInvoiceCreditHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `חשבונית-מס-זיכוי-${data.creditInvoiceNumber}.pdf`,
    returnBlob,
  });
}
