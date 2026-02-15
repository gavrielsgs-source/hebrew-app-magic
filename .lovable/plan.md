

# תיקון הורדת מסמכים מעמוד הלקוח

## הבעיה
מסמכים מקושרים (attached) מטבלת `documents` מגיעים עם:
- `url: "/document-production/receipt"` (נתיב פנימי באפליקציה, לא קובץ אמיתי)
- `file_path: null` (אין קובץ באחסון)

כשלוחצים "הורד PDF", הקוד:
1. מציג טוסט "מכין את המסמך להורדה..."
2. בודק `file_path` - ריק
3. בודק `url` - לא מתחיל ב-`http`
4. נתקע או מציג הודעה גנרית בלי להוריד כלום

## הפתרון
לתקן את `handleDownloadPDF` ב-`CustomerDocuments.tsx`:

1. **מסמכים עם URL פנימי** (כמו `/document-production/receipt`) -- לפתוח את הנתיב הפנימי בחלון חדש, כי שם המשתמש יכול לצפות ולהוריד
2. **להחליף את `generatePdfBlobForDoc`** מ-`html2pdf` הישן לפונקציית `generatePDF` מ-`pdf-helper.ts` (שעובדת עם html2canvas + jsPDF)
3. **להסיר את ה-import של `html2pdf`** מהקובץ

## שינויים טכניים

### קובץ: `src/components/customers/CustomerDocuments.tsx`

**שינוי 1**: הסרת `import html2pdf` (שורה 15) והוספת `import { generatePDF } from '@/utils/pdf-helper'`

**שינוי 2**: עדכון `generatePdfBlobForDoc` (שורות 74-97) להשתמש ב-`generatePDF` עם `returnBlob: true`

**שינוי 3**: עדכון `handleDownloadPDF` (שורות 341-405):
- מסמכים עם URL פנימי (מתחיל ב-`/`) -- פתיחה בחלון חדש עם `window.open`
- מסמכים עם `file_path` -- הורדה מ-storage כרגיל
- מסמכים עם URL חיצוני (`http`) -- הורדה ישירה
- fallback -- יצירת PDF עם `generatePDF` במקום הודעת שגיאה

