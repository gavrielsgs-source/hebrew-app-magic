
# תיקון הורדת מסמך מעמוד הלקוח - שימוש ב-PDF המקורי

## הבעיה
כל מסמך שנוצר מעמוד הפקת מסמכים יוצר **שתי רשומות** בטבלת `documents`:
1. רשומה עם שם עברי (למשל "קבלה - 0001"), URL פנימי (`/document-production/receipt`), **בלי** `file_path`
2. רשומה עם שם אנגלי (למשל "receipt - 0001"), **עם** `file_path` ו-URL לקובץ ה-PDF האמיתי

כשמורידים מעמוד הלקוח, הקוד רואה את הרשומה הראשונה (בלי file_path) ופותח חלון חדש לנתיב פנימי, או מנסה ליצור PDF גנרי עם עיצוב בסיסי - במקום להוריד את ה-PDF המעוצב שכבר קיים.

## הפתרון
לפני שפותחים חלון חדש או יוצרים PDF גנרי - לחפש בטבלת `documents` רשומה תואמת **עם** `file_path` (אותו `type`, אותו `entity_id`, אותו `user_id`) ולהוריד ממנה את ה-PDF המקורי.

## שינויים טכניים

### קובץ: `src/components/customers/CustomerDocuments.tsx`

**שינוי ב-`handleDownloadPDF`** (Priority 1 - attached docs with internal URL):

במקום לפתוח `window.open(doc.url, '_blank')` מיד, קודם לבצע שאילתה:

```text
// חיפוש רשומה תואמת עם file_path
const { data: matchingDoc } = await supabase
  .from('documents')
  .select('file_path, url')
  .eq('user_id', user.id)
  .eq('type', doc.type || doc.entity_type)
  .eq('entity_type', doc.entity_type)
  .eq('entity_id', doc.entity_id)
  .not('file_path', 'is', null)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

אם נמצא `matchingDoc` עם `file_path`:
- להוריד את ה-PDF מ-bucket `documents` (כי שם הוא הועלה ע"י `useUploadProductionDocument`)

אם לא נמצא:
- fallback לפתיחת הנתיב הפנימי בחלון חדש (ההתנהגות הנוכחית)

### סדר העדיפויות החדש:
1. מסמך מצורף עם URL פנימי -- חיפוש PDF תואם בטבלה, אם יש - הורדה ישירה, אם אין - פתיחת חלון חדש
2. מסמך עם `file_path` -- הורדה מ-storage (ללא שינוי)
3. URL חיצוני -- הורדה ישירה (ללא שינוי)
4. fallback -- יצירת PDF בסיסי (ללא שינוי)

### מה צריך:
- גישה ל-`user` בתוך הפונקציה (כבר קיים ב-hook `useAuth` שמיובא בקומפוננטה)
