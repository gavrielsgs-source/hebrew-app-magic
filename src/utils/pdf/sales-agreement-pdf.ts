import { generatePDF, wrapInHTMLDocument, formatCurrency } from '../pdf-helper';
import type { SalesAgreementData } from '@/types/document-production';

function createSalesAgreementHTML(data: SalesAgreementData): string {
  const body = `
    <div class="doc-header">
      <div>
        <div class="doc-title">הסכם מכר רכב</div>
        <div class="doc-subtitle">תאריך: ${data.date}</div>
      </div>
      <div class="logo-area">
        <div style="font-size:18px;font-weight:bold;color:#1a365d">${data.seller.company}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">פרטי המוכר</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.seller.company}</span></div>
        <div class="info-row"><span class="info-label">ח.פ / ת.ז:</span><span class="info-value">${data.seller.id}</span></div>
        <div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.seller.phone}</span></div>
        <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.seller.address.street}, ${data.seller.address.city}</span></div>
      </div>
      <div class="info-box">
        <div class="info-box-title">פרטי הקונה</div>
        <div class="info-row"><span class="info-label">שם:</span><span class="info-value">${data.buyer.name}</span></div>
        <div class="info-row"><span class="info-label">ת.ז:</span><span class="info-value">${data.buyer.id}</span></div>
        <div class="info-row"><span class="info-label">טלפון:</span><span class="info-value">${data.buyer.phone}</span></div>
        <div class="info-row"><span class="info-label">כתובת:</span><span class="info-value">${data.buyer.address}</span></div>
      </div>
    </div>

    ${data.car ? `
    <div class="info-box" style="margin-bottom:15px">
      <div class="info-box-title">פרטי הרכב</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <div class="info-row" style="flex:1;min-width:200px"><span class="info-label">יצרן:</span><span class="info-value">${data.car.make}</span></div>
        <div class="info-row" style="flex:1;min-width:200px"><span class="info-label">דגם:</span><span class="info-value">${data.car.model}</span></div>
        <div class="info-row" style="flex:1;min-width:200px"><span class="info-label">שנה:</span><span class="info-value">${data.car.year}</span></div>
        <div class="info-row" style="flex:1;min-width:200px"><span class="info-label">ק"מ:</span><span class="info-value">${data.car.mileage?.toLocaleString()}</span></div>
        <div class="info-row" style="flex:1;min-width:200px"><span class="info-label">מס' רישוי:</span><span class="info-value">${data.car.licenseNumber || '-'}</span></div>
        <div class="info-row" style="flex:1;min-width:200px"><span class="info-label">מס' שלדה:</span><span class="info-value">${data.car.chassisNumber || '-'}</span></div>
      </div>
    </div>
    ` : ''}

    <div class="summary-box">
      <div class="info-box-title" style="border:none;padding:0;margin-bottom:10px">פרטים כספיים</div>
      <div class="summary-row"><span>מחיר כולל:</span><span style="font-weight:bold">${formatCurrency(data.financial.totalPrice)}</span></div>
      <div class="summary-row"><span>מקדמה:</span><span>${formatCurrency(data.financial.downPayment)}</span></div>
      <div class="summary-row summary-total"><span>יתרה לתשלום:</span><span>${formatCurrency(data.financial.remainingAmount || (data.financial.totalPrice - data.financial.downPayment))}</span></div>
    </div>

    ${data.financial.paymentTerms ? `
    <div class="notes-box" style="margin-top:15px">
      <div class="notes-title">תנאי תשלום</div>
      <div>${data.financial.paymentTerms}</div>
    </div>
    ` : ''}

    ${data.financial.specialTerms ? `
    <div class="notes-box">
      <div class="notes-title">תנאים מיוחדים</div>
      <div>${data.financial.specialTerms}</div>
    </div>
    ` : ''}

    <div class="signatures">
      <div class="signature-block">
        <div class="signature-line">חתימת המוכר</div>
      </div>
      <div class="signature-block">
        <div class="signature-line">חתימת הקונה</div>
      </div>
    </div>

    <div class="footer">
      מסמך זה הופק באופן אוטומטי | ${data.seller.company}
    </div>
  `;
  return wrapInHTMLDocument(body);
}

export async function generateSalesAgreementPDF(data: SalesAgreementData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createSalesAgreementHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `הסכם-מכר-${data.date}.pdf`,
    returnBlob,
  });
}
