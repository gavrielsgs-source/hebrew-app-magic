import html2pdf from 'html2pdf.js';
import type { ReceiptData } from '@/types/receipt';

export async function generateReceiptPDF(data: ReceiptData, returnBlob: boolean = false): Promise<void | Blob> {
  const element = document.createElement('div');
  element.innerHTML = createReceiptPDFHTML(data);
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

  const opt = {
    margin: 0,
    filename: `קבלה-${data.receiptNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    if (returnBlob) {
      const blob = await html2pdf().set(opt).from(element).outputPdf('blob');
      document.body.removeChild(element);
      return blob;
    } else {
      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
    }
  } catch (error) {
    document.body.removeChild(element);
    throw error;
  }
}

function createReceiptPDFHTML(data: ReceiptData): string {
  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
  };

  const paymentTypeLabels: Record<string, string> = {
    cash: 'מזומן',
    check: 'המחאות',
    credit_card: 'כרטיסי אשראי',
    bank_transfer: 'העברות בנקאיות',
    other: 'אחר',
    tax_deduction: 'ניכוי מס במקור',
    vehicle: 'רכבים'
  };

  const paymentRows = data.payments.map(payment => `
    <tr>
      <td class="table-cell">${paymentTypeLabels[payment.type] || payment.type}</td>
      <td class="table-cell center">${formatDate(payment.date)}</td>
      <td class="table-cell center">${payment.reference || '-'}</td>
      <td class="table-cell left bold">${formatCurrency(payment.amount)}</td>
    </tr>
  `).join('');

  const receiptForLabel: Record<string, string> = {
    none: 'ללא מסמך משוייך',
    tax_invoice: 'חשבונית מס',
    receipt_cancellation: 'ביטול קבלה'
  };

  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; font-size: 14px; line-height: 1.6;">
      <style>
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 10px 0;
          color: #7c3aed;
        }
        .header-info {
          font-size: 16px;
          color: #666;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
        }
        .info-box {
          width: 48%;
        }
        .info-box h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 10px 0;
          color: #7c3aed;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .info-box p {
          margin: 5px 0;
          font-size: 13px;
        }
        .receipt-for {
          margin-bottom: 20px;
          padding: 15px;
          background: #f5f3ff;
          border-radius: 8px;
        }
        .receipt-for p {
          margin: 0;
          font-size: 14px;
        }
        .receipt-for .sub {
          margin-top: 5px;
          font-size: 12px;
          color: #666;
        }
        .table-section h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 15px 0;
          color: #7c3aed;
        }
        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .payment-table th {
          background: #7c3aed;
          color: white;
          padding: 12px;
          text-align: right;
          font-weight: bold;
        }
        .payment-table th.center {
          text-align: center;
        }
        .payment-table th.left {
          text-align: left;
        }
        .table-cell {
          padding: 10px 12px;
          border-bottom: 1px solid #e0e0e0;
          text-align: right;
        }
        .table-cell.center {
          text-align: center;
        }
        .table-cell.left {
          text-align: left;
        }
        .table-cell.bold {
          font-weight: bold;
        }
        .summary-box {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .summary-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
        }
        .summary-item {
          flex: 1;
          min-width: 100px;
        }
        .summary-item .label {
          font-size: 11px;
          opacity: 0.8;
          margin: 0;
        }
        .summary-item .value {
          font-size: 14px;
          font-weight: bold;
          margin: 5px 0 0 0;
        }
        .summary-total {
          border-top: 1px solid rgba(255,255,255,0.3);
          padding-top: 15px;
          text-align: center;
        }
        .summary-total .label {
          font-size: 14px;
          opacity: 0.8;
          margin: 0;
        }
        .summary-total .value {
          font-size: 28px;
          font-weight: bold;
          margin: 5px 0 0 0;
        }
        .notes-section {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-right: 4px solid #7c3aed;
        }
        .notes-section h4 {
          margin: 0 0 10px 0;
          color: #7c3aed;
          font-size: 14px;
        }
        .notes-section p {
          margin: 0;
          font-size: 13px;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #888;
          font-size: 11px;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
      </style>

      <!-- Header with Logo -->
      <div class="header">
        ${data.company.logoUrl ? `
          <div style="margin-bottom: 15px;">
            <img src="${data.company.logoUrl}" alt="לוגו החברה" style="max-height: 60px; max-width: 180px; object-fit: contain;" />
          </div>
        ` : ''}
        <h1>קבלה</h1>
        <div class="header-info">
          <strong>מספר: ${data.receiptNumber}</strong>
          <span style="margin: 0 10px;">|</span>
          <span>${formatDate(data.date)}</span>
        </div>
      </div>

      <!-- Company & Customer Info -->
      <div class="info-section">
        <div class="info-box">
          <h3>פרטי החברה</h3>
          <p><strong>${data.company.name}</strong></p>
          <p>${data.company.address}</p>
          <p>ח.פ: ${data.company.hp}</p>
          <p>טל: ${data.company.phone}</p>
        </div>
        <div class="info-box">
          <h3>פרטי הלקוח</h3>
          <p><strong>${data.customer.name}</strong></p>
          <p>${data.customer.address}</p>
          <p>ח.פ/ת.ז: ${data.customer.hp}</p>
          <p>טל: ${data.customer.phone}</p>
        </div>
      </div>

      <!-- Receipt For -->
      <div class="receipt-for">
        <p><strong>קבלה עבור:</strong> ${receiptForLabel[data.receiptForType]}</p>
        ${data.originalInvoice ? `
          <p class="sub">
            חשבונית מס מספר: ${data.originalInvoice.invoiceNumber} | תאריך: ${formatDate(data.originalInvoice.date)} | סכום: ${formatCurrency(data.originalInvoice.totalAmount)}
          </p>
        ` : ''}
      </div>

      <!-- Payments Table -->
      <div class="table-section">
        <h3>תשלומים</h3>
        <table class="payment-table">
          <thead>
            <tr>
              <th>סוג תשלום</th>
              <th class="center">תאריך</th>
              <th class="center">אסמכתא</th>
              <th class="left">סכום</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="summary-box">
        <div class="summary-grid">
          <div class="summary-item">
            <p class="label">סה"כ מזומן</p>
            <p class="value">${formatCurrency(data.totals.cash)}</p>
          </div>
          <div class="summary-item">
            <p class="label">סה"כ המחאות</p>
            <p class="value">${formatCurrency(data.totals.check)}</p>
          </div>
          <div class="summary-item">
            <p class="label">סה"כ כרטיסי אשראי</p>
            <p class="value">${formatCurrency(data.totals.creditCard)}</p>
          </div>
          <div class="summary-item">
            <p class="label">סה"כ העברות בנקאיות</p>
            <p class="value">${formatCurrency(data.totals.bankTransfer)}</p>
          </div>
          <div class="summary-item">
            <p class="label">סה"כ אחר</p>
            <p class="value">${formatCurrency(data.totals.other)}</p>
          </div>
          <div class="summary-item">
            <p class="label">סה"כ ניכוי מס במקור</p>
            <p class="value">${formatCurrency(data.totals.taxDeduction)}</p>
          </div>
          <div class="summary-item">
            <p class="label">סה"כ רכבים</p>
            <p class="value">${formatCurrency(data.totals.vehicle)}</p>
          </div>
        </div>
        <div class="summary-total">
          <p class="label">סה"כ שולם</p>
          <p class="value">${formatCurrency(data.totals.grandTotal)}</p>
        </div>
      </div>

      <!-- Notes -->
      ${data.notes ? `
        <div class="notes-section">
          <h4>הערות</h4>
          <p>${data.notes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <p>מסמך זה הופק באופן אוטומטי | ${data.company.name}</p>
      </div>
    </div>
  `;
}
