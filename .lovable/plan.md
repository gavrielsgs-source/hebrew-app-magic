
# תיקון: PDF ריק בהורדה מעמוד הלקוח

## הבעיה
כשמורידים PDF מעמוד הלקוחות, המסמך יוצא ריק. הבעיה קורית גם במסמכים שנוצרו בעמוד ייצור המסמכים וגם במסמכים שנוצרו ישירות מעמוד הלקוח.

## ניתוח הגורם -- 3 בעיות שונות

### בעיה 1: מסמכים מיוצור מסמכים לא נמצאים בהורדה
מסמכים שנוצרים בעמוד ייצור המסמכים (הצעת מחיר, קבלה, חשבונית מס) מועלים ל-bucket בשם **`documents`** עם נתיב `userId/filename.pdf`. אבל כשמנסים להוריד מעמוד הלקוח, הקוד מחפש את הקובץ ב-bucket **`customer-documents`** -- שם הקובץ לא קיים. ההורדה נכשלת בשקט ונופלת ל-fallback שמייצר PDF חדש מאפס עם נתונים חלקיים.

### בעיה 2: Fallback ב-handleDownloadPDF ללא position fix
ה-fallback הגנרי (שורות 600-615) שמייצר PDF כללי כשלא מזוהה סוג ספציפי -- לא מחיל את תיקון ה-`position: fixed` שעשינו ב-PDF generators. האלמנט מתווסף ל-DOM בלי מיקום מפורש, מה שגורם ל-`html2canvas` לייצר עמוד ריק.

### בעיה 3: מסמכים מצורפים (attached) לא מורידים נכון
מסמכים שמגיעים מ-`useCustomerRelatedDocuments` (חשבוניות מס, הצעות מחיר שנוצרו בייצור מסמכים) מכילים `file_path` ו-`url`. הקוד הנוכחי לא מנצל את ה-URL הישיר שכבר קיים עבור מסמכים אלו.

## הפתרון

### שינוי 1: תיקון `handleDownloadPDF` -- שימוש ב-URL ישיר למסמכים מצורפים
עבור מסמכים שמגיעים מ-`useCustomerRelatedDocuments` ויש להם `file_path` בטבלת `documents`, להוריד מ-bucket `documents` (לא `customer-documents`). ועבור מסמכים עם URL ישיר, להשתמש בו ישירות.

### שינוי 2: תיקון ה-fallback הגנרי
להוסיף `position: fixed; top: 0; left: 0; z-index: -9999; opacity: 0` לאלמנט ב-fallback הגנרי, כמו שעשינו בשאר ה-generators.

### שינוי 3: הורדה חכמה לפי מקור המסמך
להבדיל בין מסמכים מטבלת `customer_documents` (bucket: `customer-documents`) לבין מסמכים מטבלת `documents` (bucket: `documents`) ולהוריד מה-bucket הנכון.

## פרטים טכניים

### קובץ לעדכון: `src/components/customers/CustomerDocuments.tsx`

#### שינויים ב-handleDownloadPDF:
1. הוספת בדיקה: אם המסמך הוא `attached` ויש לו `file_path`, להוריד מ-bucket `documents`
2. תיקון ה-fallback (שורות 600-615): הוספת `position: fixed` כמו ב-generators
3. סדר עדיפות בהורדה:
   - מסמך attached עם URL ישיר -- פתיחה ישירה
   - מסמך attached עם file_path -- הורדה מ-`documents` bucket
   - מסמך customer_documents עם file_path -- הורדה מ-`customer-documents` bucket
   - fallback -- יצירת PDF חדש עם position fix

#### שינויים ב-handleSendToWhatsApp:
אותו תיקון -- כשמסמך attached יש לו `file_path` מ-`documents` bucket, להשתמש בו ולא לנסות להעלות מחדש ל-`customer-documents`.
