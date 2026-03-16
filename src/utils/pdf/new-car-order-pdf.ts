import { generatePDF, wrapInHTMLDocument, formatCurrency } from '../pdf-helper';

export interface NewCarOrderPDFData {
  orderNumber: string;
  date: string;
  customer: {
    fullName: string;
    firstName: string;
    birthYear: string;
    idNumber: string;
    city: string;
    address: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    netPrice: number;
    discount: number;
    quantity: number;
    finalPrice: number;
  }>;
  financial: {
    subtotal: number;
    totalDiscount: number;
    vat?: number;
    total: number;
  };
  includeVAT?: boolean;
  notes?: string;
  company?: {
    name: string;
    address: string;
    hp: string;
    phone: string;
    authorizedDealer: boolean;
    logoUrl?: string;
  };
}

function createNewCarOrderHTML(data: NewCarOrderPDFData): string {
  const itemsRows = data.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.netPrice)}</td>
      <td>${item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
      <td>${formatCurrency(item.finalPrice)}</td>
    </tr>
  `).join('');

  const body = `
    <div class="doc-header">
      <div>
        <div class="doc-title">הזמנת רכב חדש</div>
        <div class="doc-subtitle">מספר: ${data.orderNumber} | תאריך: ${new Date(data.date).toLocaleDateString('he-IL')}</div>
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
        <div class="info-row"><span class="info-label">ת.ז:</span><span class="info-value">${data.customer.idNumber}</span></div>
        ${data.customer.phone ? `<div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.customer.phone}</span></div>` : ''}
        <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.customer.address}, ${data.customer.city}</span></div>
        <div class="info-row"><span class="info-label">שנת לידה:</span><span class="info-value">${data.customer.birthYear}</span></div>
      </div>
    </div>
    ` : `
    <div class="info-box" style="margin-bottom:15px">
      <div class="info-box-title">פרטי הלקוח</div>
      <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.customer.fullName}</span></div>
      <div class="info-row"><span class="info-label">ת.ז:</span><span class="info-value">${data.customer.idNumber}</span></div>
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
          <th>מחיר נטו</th>
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

    ${data.notes ? `
    <div class="notes-box">
      <div class="notes-title">הערות</div>
      <div>${data.notes}</div>
    </div>
    ` : ''}

    <div class="footer">
      הזמנת רכב חדש | מסמך זה הופק באופן אוטומטי
    </div>
  `;
  return wrapInHTMLDocument(body);
}

export async function generateNewCarOrderPDF(data: NewCarOrderPDFData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createNewCarOrderHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `הזמנת-רכב-${data.orderNumber}.pdf`,
    returnBlob,
  });
}
