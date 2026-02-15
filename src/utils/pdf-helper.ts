import html2pdf from 'html2pdf.js';

export interface GeneratePDFOptions {
  htmlContent: string;
  filename: string;
  returnBlob?: boolean;
}

export async function generatePDF(options: GeneratePDFOptions): Promise<Blob | void> {
  const { htmlContent, filename, returnBlob = false } = options;

  // Create a hidden iframe for rendering
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.overflow = 'hidden';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  try {
    // Write full HTML document into iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Cannot access iframe document');

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 600));

    const body = iframeDoc.body;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const 
      },
    };

    if (returnBlob) {
      const blob = await html2pdf().from(body).set(opt).output('blob');
      return blob as Blob;
    } else {
      await html2pdf().from(body).set(opt).save();
    }
  } finally {
    // Cleanup
    document.body.removeChild(iframe);
  }
}

// Shared HTML wrapper for all documents
export function wrapInHTMLDocument(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, 'Segoe UI', sans-serif;
      direction: rtl;
      text-align: right;
      color: #1a202c;
      background: #fff;
      font-size: 13px;
      line-height: 1.5;
      padding: 30px;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #1a365d;
    }
    .doc-title {
      font-size: 26px;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 14px;
      color: #4a5568;
    }
    .logo-area img {
      max-height: 60px;
      max-width: 150px;
    }
    .info-grid {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-box {
      flex: 1;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 15px;
    }
    .info-box-title {
      font-size: 14px;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 12px;
    }
    .info-label {
      color: #718096;
      font-weight: 600;
    }
    .info-value {
      color: #2d3748;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: #1a365d;
      color: #fff;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      text-align: right;
    }
    td {
      padding: 8px 12px;
      font-size: 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: right;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .summary-box {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 13px;
    }
    .summary-total {
      font-size: 16px;
      font-weight: bold;
      color: #1a365d;
      border-top: 2px solid #1a365d;
      padding-top: 8px;
      margin-top: 5px;
    }
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 12px 15px;
      margin-top: 15px;
    }
    .notes-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #a0aec0;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
    }
    .signature-block {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-top: 1px solid #1a365d;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 12px;
      color: #4a5568;
    }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

export function formatCurrency(amount: number, currency: string = 'ILS'): string {
  const symbol = currency === 'USD' ? '$' : '₪';
  return `${symbol}${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
