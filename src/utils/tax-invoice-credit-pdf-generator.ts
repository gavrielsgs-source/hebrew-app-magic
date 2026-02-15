import html2pdf from 'html2pdf.js';
import type { TaxInvoiceCreditData } from '@/types/tax-invoice-credit';

export async function generateTaxInvoiceCreditPDF(data: TaxInvoiceCreditData, returnBlob: boolean = false): Promise<void | Blob> {
  const element = document.createElement('div');
  element.innerHTML = createTaxInvoiceCreditPDFHTML(data);
  
  // Position fixed in viewport so html2canvas can capture it, but invisible to user
  element.style.position = 'fixed';
  element.style.top = '0';
  element.style.left = '0';
  element.style.zIndex = '-9999';
  element.style.pointerEvents = 'none';
  element.style.overflow = 'hidden';
  element.style.height = '0';
  
  document.body.appendChild(element);

  // Wait for content to render
  await new Promise(resolve => setTimeout(resolve, 100));

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `חשבונית-מס-זיכוי-${data.creditInvoiceNumber}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    if (returnBlob) {
      const blob = await html2pdf().set(opt).from(element).output('blob');
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

function createTaxInvoiceCreditPDFHTML(data: TaxInvoiceCreditData): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
  };

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return `
    <div dir="rtl" style="font-family: 'Arial', sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background: white;">
      <!-- Header with Logo -->
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 10px; color: white;">
        ${data.company.logoUrl ? `
          <div style="margin-bottom: 15px;">
            <img src="${data.company.logoUrl}" alt="לוגו החברה" style="max-height: 60px; max-width: 180px; object-fit: contain; background: white; padding: 5px; border-radius: 5px;" />
          </div>
        ` : ''}
        <h1 style="margin: 0 0 10px 0; font-size: 28px;">חשבונית מס זיכוי</h1>
        <p style="margin: 0; font-size: 18px;">מספר: ${data.creditInvoiceNumber}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">תאריך: ${formatDate(data.date)}</p>
      </div>

      <!-- Company & Customer Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px;">
        <div style="flex: 1; padding: 15px; background: #f8fafc; border-radius: 8px; border-right: 4px solid #dc2626;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">פרטי החברה</h3>
          <p style="margin: 5px 0;"><strong>${data.company.name}</strong></p>
          <p style="margin: 5px 0;">${data.company.address}</p>
          <p style="margin: 5px 0;">ח.פ: ${data.company.hp}</p>
          <p style="margin: 5px 0;">טלפון: ${data.company.phone}</p>
          ${data.company.authorizedDealer ? '<p style="margin: 5px 0; color: #16a34a;">✓ עוסק מורשה</p>' : ''}
        </div>
        
        <div style="flex: 1; padding: 15px; background: #f8fafc; border-radius: 8px; border-right: 4px solid #6366f1;">
          <h3 style="margin: 0 0 10px 0; color: #6366f1; font-size: 16px;">פרטי הלקוח</h3>
          <p style="margin: 5px 0;"><strong>${data.customer.name}</strong></p>
          <p style="margin: 5px 0;">${data.customer.address}</p>
          <p style="margin: 5px 0;">ח.פ/ת.ז: ${data.customer.hp}</p>
          <p style="margin: 5px 0;">טלפון: ${data.customer.phone}</p>
        </div>
      </div>

      <!-- Original Invoice Reference -->
      ${data.originalInvoice ? `
        <div style="margin-bottom: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b;">
          <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">חשבונית מקורית מזוכה</h3>
          <p style="margin: 5px 0;">
            <strong>סוג:</strong> ${data.creditForType === 'tax_invoice' ? 'חשבונית מס' : 'חשבונית מס קבלה'}
          </p>
          <p style="margin: 5px 0;">
            <strong>מספר חשבונית:</strong> ${data.originalInvoice.invoiceNumber}
          </p>
          <p style="margin: 5px 0;">
            <strong>תאריך:</strong> ${formatDate(data.originalInvoice.date)}
          </p>
          <p style="margin: 5px 0;">
            <strong>סכום מקורי:</strong> ${formatCurrency(data.originalInvoice.totalAmount)}
          </p>
        </div>
      ` : ''}

      <!-- Allocation Number -->
      ${data.allocationNumber ? `
        <div style="margin-bottom: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #22c55e;">
          <p style="margin: 0;"><strong>מספר הקצאה:</strong> ${data.allocationNumber}</p>
        </div>
      ` : ''}

      <!-- Credit Summary -->
      <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 10px; color: white;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">סיכום זיכוי</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>סכום זיכוי לפני מע"מ:</span>
          <span>${formatCurrency(data.creditAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>מע"מ (18%):</span>
          <span>${formatCurrency(data.vatAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid rgba(255,255,255,0.3); font-size: 20px; font-weight: bold;">
          <span>סה"כ זיכוי:</span>
          <span>${formatCurrency(data.totalCreditAmount)}</span>
        </div>
      </div>

      <!-- Notes -->
      ${data.notes ? `
        <div style="margin-bottom: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #475569; font-size: 16px;">הערות</h3>
          <p style="margin: 0; white-space: pre-wrap;">${data.notes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between;">
        <div style="text-align: center; flex: 1;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px;"></div>
          <p style="margin: 0; font-size: 12px;">חתימת המנפיק</p>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px;"></div>
          <p style="margin: 0; font-size: 12px;">חתימת הלקוח</p>
        </div>
      </div>
    </div>
  `;
}
