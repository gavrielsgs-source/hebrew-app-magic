import { generatePDF, formatCurrency } from '../pdf-helper';
import type { SalesAgreementData } from '@/types/document-production';

function createSalesAgreementHTML(data: SalesAgreementData): string {
  const sellerAddress = `${data.seller.address.street}, ${data.seller.address.city}${data.seller.address.country ? ', ' + data.seller.address.country : ''}`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, 'Segoe UI', sans-serif;
      direction: rtl;
      text-align: right;
      color: #1a202c;
      background: #fff;
      font-size: 13px;
      line-height: 1.6;
      padding: 40px 45px;
    }
    .title {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #1a202c;
      margin-bottom: 6px;
    }
    .subtitle {
      text-align: center;
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
    }
    .divider {
      border: none;
      border-top: 2px solid #2b6cb0;
      margin-bottom: 20px;
    }
    .date-line {
      text-align: right;
      font-size: 14px;
      margin-bottom: 18px;
      color: #333;
    }
    .section-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px 22px;
      margin-bottom: 16px;
    }
    .seller-box {
      background: #f0fff4;
    }
    .buyer-box {
      background: #fefce8;
    }
    .financial-box {
      background: #fef9e7;
    }
    .section-label {
      font-size: 16px;
      font-weight: bold;
      color: #2b6cb0;
      text-align: center;
      margin-bottom: 12px;
    }
    .detail-line {
      text-align: center;
      font-size: 13px;
      margin-bottom: 4px;
      color: #333;
    }
    .detail-line strong {
      color: #1a202c;
    }
    .role-label {
      text-align: right;
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }
    .car-section {
      margin-bottom: 16px;
    }
    .car-title {
      font-size: 16px;
      font-weight: bold;
      color: #2b6cb0;
      text-align: center;
      margin-bottom: 6px;
    }
    .car-intro {
      text-align: center;
      font-size: 13px;
      color: #333;
      margin-bottom: 10px;
    }
    .car-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .car-table th, .car-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: center;
      font-size: 12px;
    }
    .car-table th {
      background: #f7fafc;
      font-weight: bold;
      color: #333;
    }
    .car-table td {
      color: #555;
    }
    .financial-line {
      text-align: center;
      font-size: 14px;
      margin-bottom: 5px;
      color: #333;
    }
    .financial-line strong {
      color: #1a202c;
    }
    .terms-section {
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .terms-title {
      font-size: 16px;
      font-weight: bold;
      color: #2b6cb0;
      text-align: center;
      margin-bottom: 12px;
    }
    .terms-list {
      list-style: none;
      padding: 0;
      counter-reset: terms-counter;
    }
    .terms-list li {
      counter-increment: terms-counter;
      padding: 6px 0;
      font-size: 12px;
      line-height: 1.7;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      text-align: right;
    }
    .terms-list li:last-child {
      border-bottom: none;
    }
    .terms-list li::before {
      content: counter(terms-counter) ". ";
      font-weight: bold;
      color: #2b6cb0;
    }
    .consent-box {
      background: #f0f7ff;
      border: 1px solid #bee3f8;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 16px;
      font-size: 11px;
      color: #555;
      line-height: 1.7;
    }
    .consent-box p {
      margin-bottom: 4px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 10px;
    }
    .sig-block {
      text-align: center;
      width: 40%;
    }
    .sig-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 8px;
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }
    .sig-date {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
    .special-terms-box {
      background: #fffbeb;
      border: 1px solid #fbbf24;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 16px;
    }
    .special-terms-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 6px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="title">הסכם מכר</div>
  <div class="subtitle">מס' הסכם: ${Math.floor(Math.random() * 900000 + 100000)} | תאריך: ${data.date}</div>
  <hr class="divider">

  <div class="date-line">שנערך ונחתם ב______ בתאריך ${data.date}</div>

  <!-- Seller -->
  <div class="section-box seller-box">
    <div class="section-label">בין:</div>
    <div class="detail-line"><strong>מר ${data.seller.company}</strong></div>
    <div class="detail-line">ח.פ./ת.ז: ${data.seller.id}</div>
    <div class="detail-line">טלפון: ${data.seller.phone}</div>
    <div class="detail-line">כתובת: ${sellerAddress}</div>
    <div class="role-label">להלן: "המוכר"</div>
  </div>

  <!-- Buyer -->
  <div class="section-box buyer-box">
    <div class="section-label">לבין:</div>
    <div class="detail-line"><strong>מר ${data.buyer.name}</strong></div>
    <div class="detail-line">ת.ז: ${data.buyer.id}</div>
    <div class="detail-line">טלפון: ${data.buyer.phone}</div>
    <div class="detail-line">כתובת: ${data.buyer.address}</div>
    <div class="role-label">להלן: "הקונה"</div>
  </div>

  <!-- Car Details -->
  ${data.car ? `
  <div class="car-section">
    <div class="car-title">פרטי הרכב:</div>
    <div class="car-intro">המוכר הסכים למכור לקונה והקונה הסכים לקנות מהמוכר את הרכב כדלקמן:</div>
    <table class="car-table">
      <tr>
        <th>תוצר:</th>
        <td>${data.car.make}</td>
        <th>דגם:</th>
        <td>${data.car.model}</td>
      </tr>
      <tr>
        <th>שנת ייצור:</th>
        <td>${data.car.year}</td>
        <th>מד קילומטרים:</th>
        <td>${(data.car.mileage || 0).toLocaleString()}</td>
      </tr>
      ${data.car.licenseNumber ? `
      <tr>
        <th>מס' רישוי:</th>
        <td>${data.car.licenseNumber}</td>
        <th>מס' שלדה:</th>
        <td>${data.car.chassisNumber || '—'}</td>
      </tr>
      ` : ''}
    </table>
    <div class="role-label">להלן: "הרכב"</div>
  </div>
  ` : ''}

  <!-- Financial Terms -->
  <div class="section-box financial-box">
    <div class="section-label">תנאים כספיים:</div>
    <div class="financial-line"><strong>תמורת הרכב ישלם הקונה למוכר:</strong> ${formatCurrency(data.financial.totalPrice)} ש"ח</div>
    <div class="financial-line"><strong>עם חתימת ההסכם:</strong> ${formatCurrency(data.financial.downPayment)} ש"ח</div>
    <div class="financial-line"><strong>יתרה לתשלום:</strong> ${formatCurrency(data.financial.remainingAmount || (data.financial.totalPrice - data.financial.downPayment))} ש"ח</div>
  </div>

  ${data.financial.paymentTerms ? `
  <div class="special-terms-box">
    <div class="special-terms-title">תנאי תשלום:</div>
    <div style="font-size:12px;color:#333">${data.financial.paymentTerms}</div>
  </div>
  ` : ''}

  ${data.financial.specialTerms ? `
  <div class="special-terms-box">
    <div class="special-terms-title">תנאים מיוחדים:</div>
    <div style="font-size:12px;color:#333">${data.financial.specialTerms}</div>
  </div>
  ` : ''}

  <!-- Agreement Terms -->
  <div class="terms-section">
    <div class="terms-title">תנאי ההסכם:</div>
    <ol class="terms-list">
      <li>המוכר מצהיר כי לאחר שבדק במשרד הרישוי מצא כי הרכב נקי מכל חוב או שיעבוד או עיקול או צד שלישי כלשהו. היה ומתברר כי על הרכב רובץ מכל הגזר לעיל, מתחייב המוכר לנקוט בהליכים משפטיים על מנת להמציא לקונה את שחרורו.</li>
      <li>הרכב הינו רכוש המוכר עד פרעון התשלום האחרון. המוכר שומר לעצמו את הזכות לקחת מהקונה את הרכב ללא הודעה מוקדמת, במידה והקונה לא עמד בתנאי התשלום או המחאותיו לא כובדו על ידי הבנק.</li>
      <li>הקונה אינו רשאי לבטל את ההסכם, ואולם אם בהסכמת המוכר יבטל הקונה את ההסכם יוחזרו לו הסכומים ששילם ללא הצמדה וניכוי הוצאות המוכר.</li>
      <li>העברת בעלות על שם הקונה עם גמר התשלום. המוכר מתחייב להעביר את הבעלות ברכב לקונה במשרד הרישוי תוך 14 יום מיום קבלת התשלום האחרון.</li>
      <li>הקונה מצהיר כי המוכר הסביר לו את מצבו הכללי של הרכב ככל הידוע לו, ולאחר שהבין את דבריו, בדק את הרכב ומצא אותו לשביעות רצונו המלאה.</li>
      <li>כל המיסים והאגרות והקנסות והתשלומים מכל סוג שהוא החלים על הרכב או על השימוש בו, מיום מסירת החזקה ברכב לקונה ואילך יחולו על הקונה במלואם.</li>
      <li>הקונה מתחייב להחזיק את הרכב בביטוח מקיף כנגד נזקי צד שלישי ונזקי גוף, וזאת לכל תקופת ההתקשרות. פוליסת הביטוח תציין זכויות המוכר ברכב.</li>
      <li>המוכר מתחייב למסור לקונה עם חתימת ההסכם את מפתחות הרכב, רישיון הרכב, תעודת הביטוח התקפה ואישור על תקינות הרכב (במידה וקיים).</li>
      <li>אם הקונה יפר איזה מתנאי ההסכם, רשאי המוכר לבטל את ההסכם לאלתר ולחזור לחזקת הרכב, וכל סכום ששילם הקונה יישאר בידי המוכר כפיצויים מוסכמים וקבועים מראש.</li>
      <li>כל שינוי בהסכם זה יהיה תקף רק אם נעשה בכתב ונחתם על ידי שני הצדדים. הסכם זה מבטל כל הסכם או הבנה קודמים בין הצדדים.</li>
      <li>מקום השיפוט היחיד בכל הנוגע לביצוע או הפרת חוזה זה נקבע בזה בבית המשפט המוסמך במקום מגורי המוכר.</li>
    </ol>
  </div>

  <!-- Consent -->
  <div class="consent-box">
    <p>* אני מאשר בזאת כי המידע שמסרתי ישמר במאגר הלקוחות וייאסף במסגרת התקשרותי עם החברה</p>
    <p>* אני מסכים ומאשר לקבל הטבות עדכונים סקירות מקצועיות והצעות למוצרים ומבצעים או שירותים נוספים באמצעות דוא"ל ומסרונים</p>
  </div>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line">חתימת המוכר</div>
      <div class="sig-date">תאריך: ______</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">חתימת הקונה</div>
      <div class="sig-date">תאריך: ______</div>
    </div>
  </div>
</body>
</html>`;
}

export async function generateSalesAgreementPDF(data: SalesAgreementData, returnBlob?: boolean): Promise<Blob | void> {
  const html = createSalesAgreementHTML(data);
  return generatePDF({
    htmlContent: html,
    filename: `הסכם-מכר-${data.date}.pdf`,
    returnBlob,
  });
}
