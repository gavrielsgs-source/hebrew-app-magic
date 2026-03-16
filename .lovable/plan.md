

## מה חסר כדי שהייצוא לרו"ח יהיה מושלם "בלחיצת כפתור"

בדקתי את כל המערכת — Edge Function, UI, שליחת מייל, ומבנה הנתונים. הנה מה שעובד ומה שחסר:

### מה כבר עובד
- יצירת ZIP עם 4 קבצי CSV (עסקאות, מלאי, יתרות, סיכום)
- צירוף מסמכי PDF לתיקיות מסודרות
- חישוב מע"מ מרג'ין/רגיל לפי `purchase_source`
- אזהרות ולידציה (חסר מקור רכישה, חסר מחיר רכישה, יתרות חוב)
- הורדת ZIP
- UI עם בחירת תקופה ומסננים מהירים

### מה חסר — 6 דברים

**1. תבנית אימייל לרו"ח לא קיימת**
הכפתור "שלח לרו"ח" קורא ל-`send-email` עם `template: "accountant_report"`, אבל הפונקציה לא מכירה את התבנית הזו — היא תומכת רק ב-`welcome`, `trial-reminder`, `payment-failed`, `payment-receipt`. המייל פשוט לא נשלח.

צריך: ליצור תבנית `AccountantReportEmail` ולהוסיף את ה-case ל-`send-email`.

**2. Storage bucket ״documents״ — אין וידוא שהוא ציבורי**
הדוח מועלה ל-bucket `documents` ומוחזר `publicUrl`. אם ה-bucket לא ציבורי, הלינק לא יעבוד — לא להורדה ולא במייל. צריך לוודא שהנתיב `reports/` נגיש או להשתמש ב-signed URL במקום.

**3. חסרה פילטרציה של מכירות/רכישות לפי user_id**
ב-queries של `customer_vehicle_sales` ו-`customer_vehicle_purchases`, הסינון `.eq("cars.user_id", user.id)` מסנן רק את ה-join ולא את הטבלה הראשית. זה עלול להחזיר עסקאות של משתמשים אחרים (אם RLS לא חוסם). צריך לסנן גם דרך `customers.user_id`.

**4. חסר סינון שנתי (שנת מס)**
רואי חשבון עובדים לפי שנת מס, לא רק לפי חודשים. כדאי להוסיף כפתור "שנת מס 2025" שמגדיר אוטומטית 01/01-31/12.

**5. חסרים פרטי החברה ב-CSV**
רואה חשבון צריך לדעת של מי הדוח — שם העסק, ח.פ., כתובת. פרטים אלה קיימים בפרופיל (`company_name`, `company_hp`, `company_address`) אבל לא מופיעים ב-CSV או בסיכום.

**6. ה-Edge Function לא deployed**
הגרסה המעודכנת (עם margin/standard) צריכה deploy כדי שתעבוד.

### תוכנית יישום

| # | משימה | קובץ |
|---|--------|------|
| 1 | יצירת תבנית אימייל `AccountantReportEmail` | `supabase/functions/_shared/email-templates/accountant-report-email.tsx` |
| 2 | הוספת case `accountant_report` ל-send-email | `supabase/functions/send-email/index.ts` |
| 3 | שימוש ב-signed URL במקום publicUrl | `supabase/functions/generate-accountant-report/index.ts` |
| 4 | תיקון סינון user_id במכירות/רכישות | `supabase/functions/generate-accountant-report/index.ts` |
| 5 | הוספת פרטי חברה ל-summary.csv + header | `supabase/functions/generate-accountant-report/index.ts` |
| 6 | הוספת כפתור "שנת מס" ב-UI | `src/pages/AccountantReports.tsx` |
| 7 | Deploy שתי ה-edge functions | `generate-accountant-report`, `send-email` |

