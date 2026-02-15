

## הוספת קישור להורדת PDF בהודעת וואטסאפ

### הבעיה
כרגע ההודעה בוואטסאפ מכילה רק את שם המסמך, מספר מסמך וסכום - בלי קישור לצפייה או הורדה של ה-PDF.

### הפתרון
לפני שליחת ההודעה, צריך:
1. ליצור את ה-PDF (אם עדיין לא קיים)
2. להעלות אותו ל-Supabase Storage
3. ליצור קישור חתום (signed URL) לגישה זמנית
4. לשלב את הקישור בהודעת הוואטסאפ

### פרטים טכניים

**קובץ: `src/components/customers/CustomerDocuments.tsx`**

שינוי בפונקציית `handleSendToWhatsApp`:

1. הפיכת הפונקציה ל-async
2. בדיקה אם כבר קיים `file_path` במסמך - אם כן, יצירת signed URL ישירות
3. אם לא קיים - יצירת HTML מהמסמך באמצעות `generateDocumentHTML`, המרה ל-PDF באמצעות `html2pdf`, העלאה ל-bucket `customer-documents`, ועדכון ה-`file_path` בטבלה
4. יצירת signed URL עם תוקף של 7 ימים (`604800` שניות) באמצעות `supabase.storage.from('customer-documents').createSignedUrl()`
5. הוספת הקישור להודעה:
```
שלום [שם],
מצורף המסמך "[כותרת]" (מס' [מספר]).
סכום: [סכום]
לצפייה והורדה: [קישור]
```

**Bucket `customer-documents`** - נשאר private (לא ציבורי). ה-signed URL מספק גישה זמנית מאובטחת למשך 7 ימים, מה שמתאים לשיתוף עם לקוחות.

### היקף השינוי
- קובץ אחד בלבד: `src/components/customers/CustomerDocuments.tsx`
- פונקציית `handleSendToWhatsApp` בלבד
- אין שינוי בשום קומפוננטה אחרת או בלוגיקת וואטסאפ אחרת במערכת
