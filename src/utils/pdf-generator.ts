import html2pdf from 'html2pdf.js';
import { SalesAgreementData } from "@/types/document-production";

export async function generateSalesAgreementPDF(data: SalesAgreementData, returnBlob?: boolean): Promise<void | Blob> {
  // Create a temporary element for the PDF content
  const element = document.createElement('div');
  element.innerHTML = createPDFHTML(data);
  
  // Apply styles for PDF
  element.style.fontFamily = '"Noto Sans Hebrew", "Rubik", Arial, sans-serif';
  element.style.direction = 'rtl';
  element.style.padding = '20px';
  element.style.backgroundColor = 'white';
  element.style.color = 'black';
  element.style.fontSize = '14px';
  element.style.lineHeight = '1.6';
  element.style.width = '210mm'; // A4 width
  element.style.boxSizing = 'border-box';
  element.style.minHeight = 'auto'; // Allow dynamic height
  
  // Position fixed in viewport so html2canvas can capture it, but invisible to user
  element.style.position = 'fixed';
  element.style.top = '0';
  element.style.left = '0';
  element.style.zIndex = '-9999';
  element.style.opacity = '0';
  
  // Append to body temporarily
  document.body.appendChild(element);

  // Wait for content to render properly
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const options = {
      margin: [10, 8, 10, 8] as [number, number, number, number],
      filename: `הסכם_מכר_${data.buyer.name || 'לקוח'}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: { 
        scale: 1.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        letterRendering: true,
        windowWidth: 794,
        windowHeight: element.scrollHeight + 100
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const,
        compress: true
      },
      pagebreak: { mode: 'css' }
    };

    if (returnBlob) {
      const blob = await html2pdf().set(options).from(element).outputPdf('blob');
      document.body.removeChild(element);
      return blob;
    } else {
      await html2pdf().set(options).from(element).save();
      document.body.removeChild(element);
    }
  } catch (error) {
    document.body.removeChild(element);
    throw error;
  }
}

function createPDFHTML(data: SalesAgreementData): string {
  return `
    <style>
      * {
        box-sizing: border-box;
      }
      
      .pdf-section {
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 15px;
      }
      
      .pdf-legal-item {
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 8px;
      }
      
      .pdf-table {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .pdf-signatures {
        page-break-before: auto;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-top: 30px;
      }
      
      .pdf-header {
        page-break-after: avoid;
        break-after: avoid;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
        break-after: avoid;
        margin-bottom: 10px;
      }
    </style>
    
    <div style="max-width: 800px; margin: 0 auto; font-size: 14px; line-height: 1.6; color: #000;">
      <!-- Header -->
      <div class="pdf-header pdf-section" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">הסכם מכר</h1>
        <div style="font-size: 12px; color: #666;">
          מס' הסכם: ${Date.now().toString().slice(-6)} | תאריך: ${data.date || new Date().toLocaleDateString('he-IL')}
        </div>
      </div>

      <!-- Agreement Opening -->
      <div class="pdf-section" style="text-align: right;">
        <p>שנערך ונחתם ב${data.seller.address?.city || '______'} בתאריך ${data.date || new Date().toLocaleDateString('he-IL')}</p>
      </div>

      <!-- Seller Information -->
      <div class="pdf-section" style="background-color: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #2c5aa0;">בין:</h3>
        <div style="text-align: right;">
          <p style="margin: 5px 0;"><strong>מר ${data.seller.company || '______'}</strong></p>
          <p style="margin: 5px 0;">ח.פ./ת.ז: ${data.seller.id || '______'}</p>
          <p style="margin: 5px 0;">טלפון: ${data.seller.phone || '______'}</p>
          <p style="margin: 5px 0;">כתובת: ${data.seller.address?.street || '______'}, ${data.seller.address?.city || '______'}, ${data.seller.address?.country || '______'}</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">להלן: <strong>"המוכר"</strong></p>
        </div>
      </div>

      <!-- Buyer Information -->
      <div class="pdf-section" style="background-color: #f0f8f4; padding: 15px; border: 1px solid #c3e6cb; border-radius: 5px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #2c5aa0;">לבין:</h3>
        <div style="text-align: right;">
          <p style="margin: 5px 0;"><strong>מר ${data.buyer.name || '______'}</strong></p>
          ${data.buyer.id ? `<p style="margin: 5px 0;">ת.ז: ${data.buyer.id}</p>` : ''}
          ${data.buyer.phone ? `<p style="margin: 5px 0;">טלפון: ${data.buyer.phone}</p>` : ''}
          ${data.buyer.address ? `<p style="margin: 5px 0;">כתובת: ${data.buyer.address}</p>` : ''}
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">להלן: <strong>"הקונה"</strong></p>
        </div>
      </div>

      ${data.car ? `
      <!-- Car Details -->
      <div class="pdf-section" style="border: 1px solid #ccc; padding: 15px; border-radius: 5px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #2c5aa0; text-align: right;">פרטי הרכב:</h3>
        <p style="margin-bottom: 10px; text-align: right;">המוכר הסכים למכור לקונה והקונה הסכים לקנות מהמוכר את הרכב כדלקמן:</p>
        <table class="pdf-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">תוצר:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.make || '______'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">דגם:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.model || '______'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">שנת ייצור:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.year || '______'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">מד קילומטרים:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(data.car.mileage || 0).toLocaleString()}</td>
          </tr>
          ${data.car.licenseNumber || data.car.chassisNumber ? `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">מספר רישוי:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.licenseNumber || '______'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">מספר שילדה:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.chassisNumber || '______'}</td>
          </tr>
          ` : ''}
          ${data.car.hand || data.car.originality ? `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">יד:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.hand || '______'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">מקוריות:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.car.originality || '______'}</td>
          </tr>
          ` : ''}
        </table>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666; text-align: right;">להלן: <strong>"הרכב"</strong></p>
      </div>
      ` : ''}

      <!-- Financial Terms -->
      <div class="pdf-section" style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #2c5aa0; text-align: right;">תנאים כספיים:</h3>
        <div style="text-align: right;">
          <p style="margin: 8px 0;"><strong>תמורת הרכב ישלם הקונה למוכר:</strong> ${(data.financial.totalPrice || 0).toLocaleString()} ש"ח</p>
          <p style="margin: 8px 0;"><strong>עם חתימת ההסכם:</strong> ${(data.financial.downPayment || 0).toLocaleString()} ש"ח</p>
          ${data.financial.remainingAmount && data.financial.remainingAmount > 0 ? 
            `<p style="margin: 8px 0;"><strong>יתרה לתשלום:</strong> ${data.financial.remainingAmount.toLocaleString()} ש"ח</p>` : ''}
          ${data.financial.paymentTerms ? 
            `<p style="margin: 8px 0;"><strong>תנאי תשלום:</strong> ${data.financial.paymentTerms}</p>` : ''}
          ${data.financial.specialTerms ? 
            `<div style="margin: 8px 0;"><strong>תנאים מיוחדים:</strong><br><p style="background-color: #f8f9fa; padding: 8px; border-radius: 3px; margin-top: 5px;">${data.financial.specialTerms}</p></div>` : ''}
        </div>
      </div>

      <!-- Legal Terms -->
      <div class="pdf-section">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #2c5aa0; text-align: right; border-bottom: 1px solid #ccc; padding-bottom: 5px;">תנאי ההסכם:</h3>
        
        ${[
          "המוכר מצהיר כי לאחר שבדק במשרד הרישוי מצא כי הרכב נקי מכל חוב או שיעבוד או עיקול או צד שלישי כלשהו. היה ומתברר בזמן כלשהו כי על הרכב רובץ מכל הנזכר לעיל, מתחייב המוכר לנקוט בהליכים משפטיים על מנת להמציא לקונה את שחרורו.",
          
          "הרכב הינו רכוש המוכר עד פרעון התשלום האחרון. המוכר שומר לעצמו את הזכות לקחת מהקונה את הרכב ללא הודעה מוקדמת, במידה והקונה לא עמד בתנאי התשלום או המחאותיו לא כובדו על ידי הבנק.",
          
          "הקונה אינו רשאי לבטל את ההסכם, ואולם אם בהסכמת המוכר יבטל הקונה את ההסכם יוחזרו לו הסכומים ששילם ללא הצמדה וריבית, בניכוי הוצאות המוכר.",
          
          "העברת בעלות על שם הקונה עם גמר התשלום. המוכר מתחייב להעביר את הבעלות ברכב לקונה במשרד הרישוי תוך 14 יום מיום קבלת התשלום האחרון.",
          
          "הקונה מצהיר כי המוכר הסביר לו את מצבו הכללי של הרכב ככל הידוע לו, ולאחר שהבין את דבריו, בדק את הרכב ומצא אותו לשביעות רצונו המלאה.",
          
          "כל המיסים והאגרות והקנסות והתשלומים מכל סוג שהוא החלים על הרכב או על השימוש בו, מיום מסירת החזקה ברכב לקונה ואילך, יחולו על הקונה במלואם.",
          
          "הקונה מתחייב להחזיק את הרכב בביטוח מקיף כנגד נזקי צד שלישי ונזקי גוף, וזאת לכל תקופת ההתקשרות. פוליסת הביטוח תציין את זכויות המוכר ברכב.",
          
          "המוכר מתחייב למסור לקונה עם חתימת ההסכם את מפתחות הרכב, רישיון הרכב, תעודת הביטוח התקפה ואישור על תקינות הרכב (במידה וקיים).",
          
          "אם הקונה יפר איזה מתנאי ההסכם, רשאי המוכר לבטל את ההסכם לאלתר ולחזור לחזקת הרכב, וכל סכום ששילם הקונה יישאר בידי המוכר כפיצויים מוסכמים וקבועים מראש.",
          
          "כל שינוי בהסכם זה יהיה תקף רק אם נעשה בכתב ונחתם על ידי שני הצדדים. הסכם זה מבטל כל הסכם או הבנה קודמים בין הצדדים.",
          
          "מקום השיפוט היחיד בכל הנוגע לביצוע או הפרת חוזה זה נקבע בזה בבית המשפט המוסמך במקום מגורי המוכר."
        ].map((term, index) => 
          `<div class="pdf-legal-item" style="background-color: #f8f9fa; padding: 10px; border-radius: 3px; border-right: 3px solid #007bff;">
            <p style="margin: 0; text-align: right; font-size: 13px; line-height: 1.5;">
              <strong>${index + 1}.</strong> ${term}
            </p>
          </div>`
        ).join('')}
      </div>

      <!-- Privacy Notice -->
      <div class="pdf-section" style="background-color: #e7f3ff; border: 1px solid #b3d9ff; padding: 10px; border-radius: 3px; font-size: 11px;">
        <p style="margin: 0 0 5px 0; text-align: right;">* אני מאשר בזאת כי המידע שמסרתי ישמר במאגר הלקוחות וייאסף במסגרת התקשרותי עם החברה</p>
        <p style="margin: 0; text-align: right;">* אני מסכים ומאשר לקבל הטבות עדכונים סקירות מקצועיות והצעות למוצרים ומבצעים או שירותים נוספים באמצעות דוא"ל ומסרונים</p>
      </div>

      <!-- Signatures -->
      <div class="pdf-signatures" style="display: table; width: 100%; border-top: 1px solid #ccc; padding-top: 20px;">
        <div style="display: table-cell; width: 50%; text-align: center; padding: 0 20px;">
          <div style="margin-top: 60px; border-top: 1px solid #333; padding-top: 8px;">
            <p style="margin: 0; font-size: 12px; font-weight: bold;">חתימת הקונה</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">תאריך: _______</p>
          </div>
        </div>
        <div style="display: table-cell; width: 50%; text-align: center; padding: 0 20px;">
          <div style="margin-top: 60px; border-top: 1px solid #333; padding-top: 8px;">
            <p style="margin: 0; font-size: 12px; font-weight: bold;">חתימת המוכר</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">תאריך: _______</p>
          </div>
        </div>
      </div>
    </div>
  `;
}