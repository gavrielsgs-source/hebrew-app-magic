

# תוכנית יישום: מודול ממשק פתוח (Open Format 1.31)

## סקירה כללית

הוספת מודול ציות (compliance) חדש למערכת הקיימת, שמייצר קבצי ייצוא בפורמט האחיד של רשות המיסים (גרסה 1.31). המודול יהיה נגיש לאדמינים בלבד ולא ישפיע על פונקציונליות קיימת.

---

## מבנה העבודה

### שלב 1: מיגרציות מסד נתונים (4 טבלאות חדשות)

**A) `open_format_export_runs`** - ריצות ייצוא
- id, user_id, mode (single_year/multi_year), tax_year, start_date, end_date
- primary_id_15 (15 ספרות), logical_output_path, encoding_used
- compression_name, status (pending/success/failed)
- started_at, finished_at, error_message, simulator_status
- RLS: admin-only + owner access

**B) `open_format_record_counts`** - ספירות רשומות לפי סוג
- id, export_run_id (FK), record_type_code (100A, 100C, 110D, 120D, 900Z, 100B, 110B, 100M, A000), count

**C) `open_format_artifacts`** - קבצים שנוצרו
- id, export_run_id (FK), artifact_type (TXT_INI/TXT_BKMVDATA/ZIP)
- filename, storage_path, checksum, byte_size, created_at

**D) `open_format_compliance_config`** - הגדרות עסק
- id, user_id, software_registration_number, software_name, software_version
- software_vendor_name, software_vendor_tax_id
- default_encoding, currency_code, branches_enabled
- RLS: owner-only

Storage bucket חדש: `open-format-exports` (private)

### שלב 2: Edge Function - `generate-open-format`

Edge function שמבצעת את כל לוגיקת הייצוא בצד שרת:

1. **ולידציית קלט** - בדיקת פרמטרים (מצב, תקופה)
2. **איסוף נתונים** - קריאה מ-`tax_invoices`, `customer_documents`, `customer_vehicle_sales`, `customer_vehicle_purchases` לפי תקופה
3. **יצירת Primary ID** - 15 ספרות ייחודיות
4. **בניית רשומות Fixed-Width**:
   - **100A** (פתיחה) - פרטי עסק, תוכנה, תקופה
   - **100C** (כותרת מסמך) - לכל חשבונית/קבלה
   - **110D** (שורת פירוט) - לכל שורת פריט במסמך
   - **120D** (פרטי תשלום/קבלה) - כשרלוונטי
   - **900Z** (סגירה) - סיכום וספירות
5. **יצירת TXT.INI** - קובץ סיכום
6. **יצירת ZIP** - BKMVDATA.zip המכיל TXT.BKMVDATA + logical_path.txt
7. **ולידציות פנימיות** - אורך רשומות, CRLF, עקביות מזהים
8. **העלאה ל-Storage** ושמירת metadata ב-DB
9. **החזרת תוצאות** - קישורי הורדה + דוח ולידציה

**Encoding**: ISO-8859-8 כברירת מחדל (עם אופציית debug ל-UTF-8)

**Formatting helpers** (schema-driven):
- `padNumericLeft(value, length)` - ריפוד אפסים משמאל
- `padAlphaRight(value, length)` - ריפוד רווחים מימין
- `formatSignedAmount(value, length, scale)` - סכום עם סימן
- `formatDateYYYYMMDD(date)` - תאריך 8 ספרות
- `formatTimeHHMM(date)` - שעה 4 ספרות
- `validateRecordLength(line, expected)` - בדיקת אורך

**Schema-driven record definitions**: כל סוג רשומה מוגדר כמערך של שדות עם שם, סוג (numeric/alpha), אורך, וערך ברירת מחדל. זה מאפשר הוספת סוגי רשומות עתידיים (100B, 110B, 100M) בלי לשכתב את המנוע.

### שלב 3: ממשק משתמש (UI)

**A) תפריט חדש ב-Sidebar** (אדמין בלבד)
- אייקון FileSpreadsheet + "ממשק פתוח"
- תת-כותרת: "FORMAT OPEN 1.31"
- מתחת ל-"ניהול מערכת" בתפריט

**B) עמוד ראשי: `/open-format`** - OpenFormatPage.tsx
- Tab 1: **אשף ייצוא** (Export Wizard)
  - בחירת מצב: שנה בודדת / רב-שנתי
  - אם שנה בודדת: בחירת שנת מס
  - אם רב-שנתי: תאריך התחלה + סיום
  - שדה תצוגה: נתיב לוגי (לפי המפרט)
  - הערה: "סינון רב-שנתי לפי תאריך מסמך. סינון יומן - בשלב עתידי"
  - כפתור "ייצא קבצים"
  
- Tab 2: **היסטוריית ייצוא** (Export History)
  - טבלה עם כל הריצות הקודמות
  - תאריך, מצב, תקופה, Primary ID, סטטוס, ספירות
  - כפתורי הורדה לכל ריצה
  - שדה סטטוס סימולטור (ידני)

- Tab 3: **הגדרות** (Compliance Config)
  - פרטי תוכנה (שם, גרסה, מפתח)
  - מספר רישום רשות המיסים (placeholder)
  - encoding ברירת מחדל
  - סניפים (פלאגים עתידיים)

**C) מסך תוצאות ייצוא** (ExportResults component)
- סטטוס (הצלחה/כשלון)
- Export Run ID + Primary ID
- חותמות זמן התחלה/סיום
- encoding + נתיב לוגי
- טבלת ספירות רשומות (כולל אפסים לסוגים עתידיים)
- רשימת בדיקות ולידציה (pass/fail)
- כפתורי הורדה: TXT.INI, TXT.BKMVDATA, BKMVDATA.zip
- הצהרה: "מודול זה מכין קבצים בלבד. בדיקת סימולטור והגשה לרשות המיסים מבוצעות חיצונית."

**D) Placeholders (Coming Soon)**
- Tab/כפתור מושבת: "דוח מודפס (סעיף 5.4 / נספח 4)"
- Tab/כפתור מושבת: "דוחות ולידציה (סעיף 2.6)"

### שלב 4: Routing + Access Control

- Route חדש: `/open-format` ב-AppLayout
- בדיקת admin ב-component (כמו Admin.tsx)
- הוספה ל-Sidebar רק למשתמשי admin

---

## מיפוי נתונים קיימים לרשומות

| נתון קיים | רשומה |
|---|---|
| `tax_invoices` | 100C (כותרת) + 110D (שורות items) |
| `customer_documents` (type=receipt) | 100C + 120D |
| `customer_vehicle_sales` | 100C + 110D (אם אין חשבונית מקושרת) |
| `customer_vehicle_purchases` | 100C + 110D (חשבונית רכש) |
| `profiles` (company_hp, company_name) | 100A (פרטי עסק) |

**TODO markers**: יסומנו שדות שדורשים מיפוי מדויק יותר (קוד סוג מסמך, מספר סניף, וכו').

---

## קבצים חדשים

```text
src/pages/OpenFormat.tsx                           - עמוד ראשי
src/components/open-format/ExportWizard.tsx         - אשף ייצוא
src/components/open-format/ExportResults.tsx        - תוצאות ריצה
src/components/open-format/ExportHistory.tsx        - היסטוריה
src/components/open-format/ComplianceConfig.tsx     - הגדרות
src/components/open-format/ValidationChecklist.tsx  - בדיקות ולידציה
src/hooks/use-open-format.ts                       - hooks לנתונים
supabase/functions/generate-open-format/index.ts   - מנוע ייצוא
```

## קבצים לעריכה

```text
src/App.tsx                          - route חדש
src/components/layout/AppSidebar.tsx  - פריט תפריט חדש (admin only)
supabase/config.toml                 - הגדרת edge function
```

## מיגרציות DB

```text
1 מיגרציה עם:
- 4 טבלאות חדשות + RLS policies
- Storage bucket חדש
- אינדקסים
```

---

## פרטים טכניים

### Logical Output Path
פורמט: `OPENFRMT/{tax_id_8}.{yy}/{MMDDhhmm}/`
- tax_id_8 = 8 ספרות ראשונות של ח.פ./ע.מ.
- yy = שנת מס (2 ספרות)
- MMDDhhmm = חודש+יום+שעה+דקה
- אם כפילות באותה דקה: increment של דקה

### Primary ID (15 ספרות)
- מבוסס על timestamp + random suffix
- נשמר ב-DB ומשמש בכל הרשומות של אותה ריצה

### Record Length Validation
כל סוג רשומה מוגדר עם אורך צפוי. אחרי יצירה, כל שורה נבדקת שהיא בדיוק באורך הנכון (לפני CRLF).

### ZIP Structure
```text
BKMVDATA.zip
  └── TXT.BKMVDATA
  └── logical_path.txt (bonus - מכיל את הנתיב הלוגי)
```

---

## איך לבדוק

1. להיכנס כאדמין
2. לגשת ל-"ממשק פתוח" בתפריט
3. לבחור שנת מס (למשל 2025) או טווח תאריכים
4. ללחוץ "ייצא קבצים"
5. לראות תוצאות עם ספירות רשומות ובדיקות ולידציה
6. להוריד את הקבצים
7. לראות את הריצה בהיסטוריה

---

## TODOs ידועים לפני הגשה סופית

- מספר רישום תוכנה רשמי מרשות המיסים
- מיפוי מדויק של קודי סוגי מסמכים (305, 320, 330 וכו')
- קודי סניפים (אם רלוונטי)
- סוגי רשומות חשבונאיות (100B, 110B, 100M) - כשמודול הנהלת חשבונות ייבנה
- דוח מודפס סעיף 5.4
- דוחות ולידציה סעיף 2.6
- בדיקת סימולטור חיצוני

