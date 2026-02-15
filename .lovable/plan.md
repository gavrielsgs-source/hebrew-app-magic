

# איפוס מלא של כל קוד ה-PDF

## מה יימחק

### 7 קבצי PDF שיימחקו לחלוטין:
1. `src/utils/pdf-render-helper.ts` -- הפונקציה המשותפת
2. `src/utils/pdf-generator.ts` -- הסכם מכר
3. `src/utils/receipt-pdf-generator.ts` -- קבלה
4. `src/utils/price-quote-pdf-generator.ts` -- הצעת מחיר
5. `src/utils/tax-invoice-pdf-generator.ts` -- חשבונית מס
6. `src/utils/tax-invoice-receipt-pdf-generator.ts` -- חשבונית מס קבלה
7. `src/utils/tax-invoice-credit-pdf-generator.ts` -- חשבונית מס זיכוי

### 7 קבצים שיעודכנו (הסרת imports וקריאות ל-PDF):
בכל עמוד שמייצר PDF, נסיר את ה-import ונחליף את הקריאה לפונקציית ה-PDF בהודעת toast שאומרת "יצירת PDF בקרוב". כך האפליקציה לא תישבר.

1. `src/pages/SalesAgreement.tsx` -- הסרת import ל-generateSalesAgreementPDF, החלפת הקריאה בהודעה
2. `src/pages/Receipt.tsx` -- הסרת import ל-generateReceiptPDF, החלפת הקריאה בהודעה
3. `src/pages/PriceQuote.tsx` -- הסרת import ל-generatePriceQuotePDF, החלפת הקריאה בהודעה
4. `src/pages/TaxInvoice.tsx` -- הסרת import ל-generateTaxInvoicePDF, החלפת הקריאה בהודעה
5. `src/pages/TaxInvoiceReceipt.tsx` -- הסרת import ל-generateTaxInvoiceReceiptPDF, החלפת הקריאה בהודעה
6. `src/pages/TaxInvoiceCredit.tsx` -- הסרת import ל-generateTaxInvoiceCreditPDF, החלפת הקריאה בהודעה
7. `src/components/customers/CustomerDocuments.tsx` -- הסרת imports ל-PDF generators וה-fallback

## מה לא ישתנה
- כל הטפסים של המסמכים (השדות, הולידציה, שמירה ל-Supabase) נשארים כמו שהם
- חיבור הסליקה שעשינו היום נשאר
- כל שאר האפליקציה נשארת
- הספריה html2pdf.js תישאר מותקנת (לשימוש עתידי כשניצור מחדש)

## התוצאה
- לחיצה על "הורד PDF" תציג הודעה "יצירת PDF בקרוב" במקום ליצור קובץ שבור
- שמירת מסמך ל-Supabase תמשיך לעבוד (בלי קובץ PDF מצורף)
- האפליקציה תעבוד בלי שגיאות

