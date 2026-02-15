

# תוכנית: מנגנון שיתוף מסמכים מאובטח בוואטסאפ

## הבעיה הנוכחית
כפתור "שלח בוואטסאפ" שולח קישור ישיר ל-Supabase Storage (signed URL) שמוביל לדף ריק או הורדת קובץ גולמי. אין דף תצוגה מקדימה, אין מעקב, ואין שליטה על פקיעת הקישור.

## הפתרון
מנגנון שיתוף עם דף ציבורי ייעודי שמציג את ה-PDF בצורה נוחה עם אפשרות הורדה.

## שלבים

### שלב 1: יצירת טבלת `document_shares` בדאטאבייס
- **טבלה חדשה** עם השדות: `id`, `document_id`, `share_id` (UUID ייחודי), `expires_at`, `revoked_at`, `created_at`, `last_viewed_at`, `view_count`, `download_count`, `user_id`
- **RLS policies**: 
  - משתמשים מחוברים יכולים ליצור/לקרוא/לעדכן שיתופים שלהם
  - קריאה ציבורית (anon) מוגבלת: רק לפי `share_id` ורק אם לא פג תוקף ולא בוטל
- אין שינוי בטבלאות קיימות

### שלב 2: יצירת Edge Function לגישה מאובטחת ל-PDF
- **Edge Function חדשה**: `get-shared-document`
- מקבלת `share_id` כפרמטר
- בודקת שהשיתוף תקף (לא פג תוקף, לא בוטל)
- מעדכנת `view_count` ו-`last_viewed_at`
- יוצרת signed URL קצר (10 דקות) מ-Storage ומחזירה אותו
- עובדת עם service role key כדי לגשת ל-Storage בלי שהמשתמש צריך להיות מחובר

### שלב 3: יצירת דף שיתוף ציבורי
- **קובץ חדש**: `src/pages/SharedDocument.tsx`
- **Route חדש**: `/share/document/:shareId` - מחוץ ל-ProtectedRoute (ציבורי)
- הדף מציג:
  - תצוגת PDF מוטמעת (iframe עם ה-signed URL)
  - כפתור "הורדה" שמוריד את ה-PDF
  - שם המסמך ותאריך
  - ברנדינג בסיסי של המערכת
- אם הקישור פג תוקף או בוטל: הודעה "הקישור פג תוקף" בלבד
- עיצוב מותאם לנייד ולדסקטופ

### שלב 4: עדכון לוגיקת שליחה בוואטסאפ
- **שינוי ב-`CustomerDocuments.tsx`** בלבד (פונקציית `handleSendToWhatsApp`):
  1. יצירת/מחזור PDF ב-Storage (כמו היום)
  2. במקום signed URL ישיר, יצירת רשומה ב-`document_shares` עם `share_id` חדש
  3. בניית URL: `https://hebrew-app-magic.lovable.app/share/document/{shareId}`
  4. שליחה דרך wa.me עם הקישור החדש
- **שינוי ב-`DocumentCard.tsx`**: עדכון פונקציית שליחת WhatsApp באותו אופן (דף המסמכים הכללי)

### שלב 5: מעקב הורדות
- כפתור "הורדה" בדף השיתוף מעדכן `download_count` דרך ה-Edge Function

## מה לא ישתנה (אפס רגרסיות)
- לוגיקת הורדת PDF מהמערכת עצמה (כפתור "הורד PDF")
- יצירת מסמכים חדשים
- ניהול מסמכים (מחיקה, עדכון סטטוס)
- הרשאות קיימות על טבלאות אחרות
- דף המסמכים הכללי (Documents.tsx) - רק הכפתור של WhatsApp משתנה
- כל שאר המערכת

## פרטים טכניים

### מבנה הטבלה
```text
document_shares
+------------------+-------------------------+
| id               | uuid (PK)               |
| document_id      | uuid (FK -> customer_documents.id) |
| share_id         | uuid (unique, v4)        |
| user_id          | uuid                     |
| expires_at       | timestamptz              |
| revoked_at       | timestamptz (nullable)   |
| created_at       | timestamptz              |
| last_viewed_at   | timestamptz (nullable)   |
| view_count       | int (default 0)          |
| download_count   | int (default 0)          |
| file_path        | text                     |
+------------------+-------------------------+
```

### Edge Function: `get-shared-document`
- `GET ?shareId=xxx&action=view` - מחזיר signed URL + metadata
- `POST ?shareId=xxx&action=download` - מעדכן download_count ומחזיר signed URL

### Route בApp.tsx
```text
// ליד inventory/:slug (מחוץ ל-ProtectedRoute)
<Route path="/share/document/:shareId" element={<SharedDocument />} />
```

### קבצים חדשים
- `src/pages/SharedDocument.tsx` - דף צפייה ציבורי
- `supabase/functions/get-shared-document/index.ts` - Edge Function

### קבצים שישתנו
- `src/App.tsx` - הוספת route חדש
- `src/components/customers/CustomerDocuments.tsx` - עדכון handleSendToWhatsApp
- `src/components/documents/components/DocumentWhatsAppDialog.tsx` - עדכון לוגיקת שליחה (אם רלוונטי)
- migration חדש לטבלת `document_shares`

