import html2pdf from 'html2pdf.js';
import type { ReceiptData } from '@/types/receipt';

export async function generateReceiptPDF(data: ReceiptData, returnBlob: boolean = false): Promise<void | Blob> {
  const element = document.createElement('div');
  element.innerHTML = createReceiptPDFHTML(data);
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `קבלה-${data.receiptNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    if (returnBlob) {
      const blob = await html2pdf().from(element).set(opt).outputPdf('blob');
      document.body.removeChild(element);
      return blob;
    } else {
      await html2pdf().from(element).set(opt).save();
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
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">${paymentTypeLabels[payment.type] || payment.type}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${formatDate(payment.date)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${payment.reference || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: left; font-weight: bold;">${formatCurrency(payment.amount)}</td>
    </tr>
  `).join('');

  const receiptForLabel = {
    none: 'ללא מסמך משוייך',
    tax_invoice: 'חשבונית מס',
    receipt_cancellation: 'ביטול קבלה'
  };

  return `
    <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #7c3aed;">
        <h1 style="margin: 0; font-size: 28px; color: #7c3aed;">קבלה</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; color: #666;">מספר: ${data.receiptNumber}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #888;">${formatDate(data.date)}</p>
      </div>

      <!-- Company & Customer Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%; text-align: right;">
          <h3 style="margin: 0 0 10px 0; color: #7c3aed; font-size: 16px;">פרטי החברה</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>${data.company.name}</strong></p>
          <p style="margin: 5px 0; font-size: 12px;">${data.company.address}</p>
          <p style="margin: 5px 0; font-size: 12px;">ח.פ: ${data.company.hp}</p>
          <p style="margin: 5px 0; font-size: 12px;">טל: ${data.company.phone}</p>
        </div>
        <div style="width: 48%; text-align: right;">
          <h3 style="margin: 0 0 10px 0; color: #7c3aed; font-size: 16px;">פרטי הלקוח</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>${data.customer.name}</strong></p>
          <p style="margin: 5px 0; font-size: 12px;">${data.customer.address}</p>
          <p style="margin: 5px 0; font-size: 12px;">ח.פ/ת.ז: ${data.customer.hp}</p>
          <p style="margin: 5px 0; font-size: 12px;">טל: ${data.customer.phone}</p>
        </div>
      </div>

      <!-- Receipt For -->
      <div style="margin-bottom: 20px; padding: 15px; background: #f5f3ff; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px;"><strong>קבלה עבור:</strong> ${receiptForLabel[data.receiptForType]}</p>
        ${data.originalInvoice ? `
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
            חשבונית מס מספר: ${data.originalInvoice.invoiceNumber} | תאריך: ${formatDate(data.originalInvoice.date)} | סכום: ${formatCurrency(data.originalInvoice.totalAmount)}
          </p>
        ` : ''}
      </div>

      <!-- Payments Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #7c3aed; font-size: 16px;">תשלומים</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #7c3aed; color: white;">
              <th style="padding: 10px; text-align: right;">סוג תשלום</th>
              <th style="padding: 10px; text-align: center;">תאריך</th>
              <th style="padding: 10px; text-align: center;">אסמכתא</th>
              <th style="padding: 10px; text-align: left;">סכום</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ מזומן</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.cash)}</p>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ המחאות</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.check)}</p>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ כרטיסי אשראי</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.creditCard)}</p>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ העברות בנקאיות</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.bankTransfer)}</p>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ אחר</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.other)}</p>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ ניכוי מס במקור</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.taxDeduction)}</p>
          </div>
          <div style="flex: 1; min-width: 120px;">
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">סה"כ רכבים</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">${formatCurrency(data.totals.vehicle)}</p>
          </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">סה"כ שולם</p>
          <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold;">${formatCurrency(data.totals.grandTotal)}</p>
        </div>
      </div>

      <!-- Notes -->
      ${data.notes ? `
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-right: 4px solid #7c3aed;">
          <h4 style="margin: 0 0 10px 0; color: #7c3aed;">הערות</h4>
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${data.notes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
        <p style="margin: 0;">מסמך זה הופק באופן אוטומטי | ${data.company.name}</p>
      </div>
    </div>
  `;
}
