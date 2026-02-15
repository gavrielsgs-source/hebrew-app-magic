import html2pdf from 'html2pdf.js';

interface RenderHtmlToPdfParams {
  htmlContent: string;
  filename: string;
  returnBlob?: boolean;
  direction?: 'rtl' | 'ltr';
}

export async function renderHtmlToPdf({
  htmlContent,
  filename,
  returnBlob = false,
  direction = 'rtl',
}: RenderHtmlToPdfParams): Promise<void | Blob> {
  // 1. Create loading overlay to hide flicker from user
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255,255,255,0.95); z-index: 99998;
    display: flex; align-items: center; justify-content: center;
    font-family: Arial, sans-serif; font-size: 18px; color: #333;
  `;
  overlay.innerHTML = '<div style="text-align:center;"><p>מכין מסמך PDF...</p></div>';
  document.body.appendChild(overlay);

  // 2. Create visible element for html2canvas to capture
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.cssText = `
    position: absolute; top: 0; left: 0; z-index: 99999;
    width: 210mm; background: white; color: black;
    font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;
    direction: ${direction}; box-sizing: border-box;
  `;
  document.body.appendChild(element);

  // 3. Wait for full render (fonts, images, layout)
  await new Promise(resolve => setTimeout(resolve, 300));

  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794, // A4 width at 96dpi
      logging: false,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
  };

  try {
    if (returnBlob) {
      const blob = await html2pdf().set(options).from(element).output('blob');
      return blob;
    } else {
      await html2pdf().set(options).from(element).save();
    }
  } finally {
    document.body.removeChild(element);
    document.body.removeChild(overlay);
  }
}
