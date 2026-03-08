

## פיצ'ר: רכב מבוקש — התאמת ליד לרכב חדש

### מה נבנה

כשמכניסים ליד למערכת, אפשר יהיה לציין איזה רכב הוא מחפש (יצרן, דגם, טווח שנים, תקציב, קילומטראז'). כשרכב חדש נכנס למלאי — המערכת תבדוק אוטומטית אם יש לידים שמחפשים בדיוק את הרכב הזה, ותציג התראה.

### שלבים

**1. מיגרציה — הוספת 6 עמודות ל-`leads`**

```sql
ALTER TABLE public.leads ADD COLUMN interested_make text;
ALTER TABLE public.leads ADD COLUMN interested_model text;
ALTER TABLE public.leads ADD COLUMN interested_year_from integer;
ALTER TABLE public.leads ADD COLUMN interested_year_to integer;
ALTER TABLE public.leads ADD COLUMN interested_max_price numeric;
ALTER TABLE public.leads ADD COLUMN interested_max_km integer;
```

ללא שינוי ב-RLS — העמודות נופלות תחת הפוליסות הקיימות.

**2. עדכון סכמת הטופס** (`lead-form-schema.ts`)

הוספת 6 שדות אופציונליים חדשים לסכמה.

**3. קומפוננטה חדשה: `AddLeadInterestedCarFields.tsx`**

סקשן מתקפל (Collapsible) עם הכותרת "🔍 רכב מבוקש (לא במלאי)" שמכיל:
- יצרן (טקסט)
- דגם (טקסט)
- משנה / עד שנה (מספרים)
- תקציב מקסימלי (מספר)
- קילומטראז' מקסימלי (מספר)

**4. שילוב בטפסים**

- `AddLeadForm.tsx` — הוספת הקומפוננטה החדשה אחרי שדה הרכב הקיים
- `MobileAddLeadForm.tsx` — אותו דבר, עם סגנון מובייל
- `EditLeadForm.tsx` — הצגת/עריכת השדות החדשים
- `use-create-lead.ts` — העברת השדות החדשים ל-INSERT (ניקוי ערכים ריקים ל-null)
- `use-update-lead.ts` — העברת השדות בעדכון

**5. בדיקת התאמה בהוספת רכב** (`use-add-car.ts`)

אחרי הוספת רכב מוצלחת, קריאה ל-`leads` עם פילטרים:
- `interested_make` תואם ל-`car.make` (case-insensitive, ilike)
- `interested_model` תואם ל-`car.model` (אם קיים)
- `interested_year_from <= car.year` ו-`interested_year_to >= car.year` (אם קיימים)
- `interested_max_price >= car.price` (אם קיים)
- `interested_max_km >= car.kilometers` (אם קיים)
- סטטוס לא `completed` ולא `cancelled`

לכל התאמה — toast עם שם הלקוח + הוספת notification לטבלת `notifications`.

### קבצים שישתנו

| קובץ | שינוי |
|------|------|
| Migration SQL | 6 עמודות חדשות ב-leads |
| `lead-form-schema.ts` | 6 שדות אופציונליים |
| חדש: `AddLeadInterestedCarFields.tsx` | קומפוננטת שדות רכב מבוקש |
| `AddLeadForm.tsx` | הוספת הסקשן החדש |
| `MobileAddLeadForm.tsx` | הוספת הסקשן החדש |
| `EditLeadForm.tsx` | הוספת הסקשן החדש |
| `LeadFormBase.tsx` | defaultValues חדשים |
| `use-create-lead.ts` | העברת השדות החדשים |
| `use-update-lead.ts` | העברת השדות החדשים |
| `use-add-car.ts` | לוגיקת matching + notifications |

