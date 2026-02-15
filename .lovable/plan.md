

# בניית מערכת PDF מחדש -- צעד צעד

## סקירה כללית
ניצור מערכת PDF חדשה ונקייה שמייצרת מסמכים יפים ומקצועיים בעברית (RTL), מותאמים למערכת ניהול סוכנות רכב. כל סוג מסמך יקבל עיצוב ייחודי שמתאים לו.

## ארכיטקטורה

### קובץ עזר משותף: `src/utils/pdf-helper.ts`
פונקציה אחת `generatePDF` שמקבלת HTML string ומייצרת PDF. הפעם בגישה בטוחה:
- יוצרת iframe נסתר (לא z-index שלילי, אלא iframe עם visibility:hidden ו-position:fixed)
- כותבת את ה-HTML לתוך ה-iframe
- מחכה לטעינה מלאה (fonts, images)
- משתמשת ב-html2pdf לצלם את תוכן ה-iframe
- מחזירה Blob או מורידה ישירות

### 6 קבצי Generator -- כל אחד בונה HTML יפה:

1. **`src/utils/pdf/sales-agreement-pdf.ts`** -- הסכם מכר
   - כותרת עם לוגו החברה
   - פרטי מוכר וקונה בטבלה מסודרת
   - פרטי הרכב (יצרן, דגם, שנה, ק"מ, מספר רישוי)
   - פרטים כספיים (מחיר, מקדמה, יתרה)
   - תנאים מיוחדים
   - חתימות

2. **`src/utils/pdf/receipt-pdf.ts`** -- קבלה
   - כותרת "קבלה" עם מספר ותאריך
   - פרטי החברה והלקוח
   - טבלת תשלומים לפי סוג (מזומן, המחאה, כרטיס אשראי, העברה בנקאית, רכב)
   - סיכום סה"כ
   - ניכוי מס במקור

3. **`src/utils/pdf/price-quote-pdf.ts`** -- הצעת מחיר
   - כותרת עם לוגו
   - פרטי לקוח
   - טבלת פריטים (תיאור, כמות, מחיר יחידה, הנחה, סה"כ)
   - סיכום כספי (סה"כ לפני מע"מ, מע"מ, סה"כ כולל)
   - תנאים ותוקף הצעה

4. **`src/utils/pdf/tax-invoice-pdf.ts`** -- חשבונית מס
   - כותרת "חשבונית מס" עם מספר
   - פרטי עוסק מורשה
   - טבלת פריטים עם מע"מ
   - סיכום כספי

5. **`src/utils/pdf/tax-invoice-receipt-pdf.ts`** -- חשבונית מס קבלה
   - כותרת "חשבונית מס / קבלה"
   - פרטי פריטים + אמצעי תשלום
   - סיכום כספי מפורט

6. **`src/utils/pdf/tax-invoice-credit-pdf.ts`** -- חשבונית מס זיכוי
   - כותרת "חשבונית מס זיכוי"
   - הפניה לחשבונית מקורית
   - סכום זיכוי, מע"מ, סה"כ

### עיצוב אחיד לכל המסמכים
- צבע ראשי כחול כהה (#1a365d) לכותרות
- רקע אפור בהיר (#f8fafc) לשורות זוגיות בטבלאות
- לוגו חברה בפינה (אם קיים)
- פרטי עוסק מורשה בתחתית
- פונט Arial לתמיכה בעברית
- כיוון RTL מלא
- פורמט A4

## שינויים בעמודים

ב-6 העמודים (SalesAgreement, Receipt, PriceQuote, TaxInvoice, TaxInvoiceReceipt, TaxInvoiceCredit):
- נוסיף import לפונקציית ה-PDF המתאימה
- נחליף את ה-toast "יצירת PDF בקרוב" בקריאה אמיתית לפונקציה
- הפונקציה תייצר ותוריד את ה-PDF

## פרטים טכניים

### מבנה pdf-helper.ts:
```text
export async function generatePDF(options: {
  htmlContent: string;
  filename: string;
  returnBlob?: boolean;
}): Promise<Blob | void>

שלבים:
1. יצירת iframe עם position:fixed, width:0, height:0, overflow:hidden
2. כתיבת HTML מלא (DOCTYPE, head עם charset utf-8, body)
3. המתנה של 500ms לטעינת fonts
4. שימוש ב-html2pdf עם scale:2, format:A4, margin:10mm
5. ניקוי ה-iframe
```

### מבנה כל generator:
```text
export function createXxxHTML(data: XxxData): string
  -- מחזיר HTML מלא עם עיצוב inline

export async function generateXxxPDF(data: XxxData, returnBlob?: boolean)
  -- קורא ל-createXxxHTML ואז ל-generatePDF
```

### סדר עבודה:
1. קודם pdf-helper.ts (הבסיס)
2. אחר כך 6 ה-generators (HTML + PDF)
3. לבסוף חיבור ל-6 העמודים

## מה לא ישתנה
- טפסים, ולידציה, שמירה ל-Supabase -- הכל נשאר
- חיבור הסליקה -- נשאר
- כל שאר האפליקציה -- נשארת

