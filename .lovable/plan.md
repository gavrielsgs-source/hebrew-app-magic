
# הפעלת העלאת PDF אוטומטית בזמן שמירת מסמכים

## הבעיה
ב-4 דפי הפקת מסמכים, יצירת ה-PDF והעלאתו ל-storage **מושבתת** עם ההערה `// PDF generation temporarily disabled`:
- `Receipt.tsx` (שורה 260)
- `PriceQuote.tsx` (שורה 204)
- `TaxInvoiceReceipt.tsx` (שורה 345)
- `TaxInvoiceCredit.tsx` (שורה 206)

ה-hook `useUploadProductionDocument` מיובא בכל הדפים אבל **לא נקרא**. לכן, כשיוצרים מסמך, נוצרת רק הרשומה העברית בטבלת `documents` (בלי file_path), אבל ה-PDF המעוצב לא נוצר ולא מועלה ל-storage.

זה מסביר למה מסמכים 0001-0003 עובדים (נוצרו כשהקוד עוד עבד) ו-0004-0008 לא (נוצרו אחרי שזה הושבת).

## הפתרון
להפעיל מחדש את יצירת ה-PDF בכל 4 הדפים. אחרי השמירה המוצלחת של המסמך:
1. ליצור את ה-PDF עם הפונקציה המתאימה (כמו `generateReceiptPDF`) עם `returnBlob: true`
2. להעלות את ה-blob ל-storage עם `uploadDocument`

## שינויים טכניים

### 1. `src/pages/Receipt.tsx` (שורות 258-260)
החלפת `// PDF generation temporarily disabled` ב:
```text
// Generate and upload PDF to storage
try {
  const pdfBlob = await generateReceiptPDF(result, true) as Blob;
  if (pdfBlob) {
    await uploadDocument({
      pdfBlob,
      documentType: 'receipt',
      documentNumber: result.receiptNumber,
      customerName: result.customer?.name || '',
      entityType: selectedEntity?.type === 'customer' ? 'customer' : 'lead',
      entityId: selectedEntity?.id,
    });
  }
} catch (pdfError) {
  console.error('Error uploading PDF:', pdfError);
}
```

### 2. `src/pages/PriceQuote.tsx` (שורה 204)
אותו דפוס -- קריאה ל-`generatePriceQuotePDF` עם `returnBlob: true` ואז `uploadDocument`

### 3. `src/pages/TaxInvoiceReceipt.tsx` (שורה 345)
אותו דפוס -- קריאה ל-`generateTaxInvoiceReceiptPDF` ואז `uploadDocument`

### 4. `src/pages/TaxInvoiceCredit.tsx` (שורה 206)
אותו דפוס -- קריאה ל-`generateTaxInvoiceCreditPDF` ואז `uploadDocument`

### 5. `src/pages/TaxInvoice.tsx`
גם כאן צריך לבדוק שה-upload קורה (למרות שאין את ההערה "disabled", ה-`uploadDocument` לא נקרא)

### מה לא משתנה
- הפונקציות ליצירת PDF כבר קיימות ועובדות
- ה-hook `useUploadProductionDocument` כבר מיובא בכל הדפים
- ה-storage bucket `documents` כבר קיים
- הלוגיקה של הורדה מעמוד הלקוח כבר מחפשת `file_path` בטבלה

### בכל דף צריך לוודא:
- `result` (התוצאה מהשמירה) מכיל את כל הנתונים שפונקציית ה-PDF צריכה
- שם הלקוח וה-entity details מועברים ל-`uploadDocument`
- ה-PDF מיוצר רק אחרי שהשמירה הצליחה (אם ה-PDF נכשל, המסמך עצמו כבר נשמר)
