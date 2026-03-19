
## הבעיה

כשמשתמש מנסה להוסיף חבר צוות, הקוד מנסה ליצור חברה (company) אם אין כזו. יצירת החברה נכשלת בגלל **שני טריגרים סותרים** על טבלת `companies`:

1. `on_company_created` → `handle_new_company_subscription` — עובד תקין, יוצר מנוי
2. `trigger_handle_new_company_with_agency` → `handle_new_company_with_agency` — **שבור**: קורא `PERFORM public.handle_new_company_subscription()` בלי העברת `NEW`, מה שגורם לקריסה

בנוסף, גם אם הטריגר הראשון היה מצליח, יש **אינדקס ייחודי** על `subscriptions.user_id` — ולמשתמש כבר יש מנוי מרגע ההרשמה (מטריגר `handle_new_user_subscription`), מה שגורם לכפילות.

**תוצאה**: יצירת חברה נכשלת → הזמנת משתמש נכשלת → "Failed to create or find company".

## פתרון

### שלב 1: מחיקת הטריגר השבור
- הסרת `trigger_handle_new_company_with_agency` מטבלת `companies` — הוא מיותר ושבור
- הטריגר `on_company_created` כבר מטפל ביצירת מנוי

### שלב 2: עדכון `handle_new_company_subscription`
- הפונקציה כבר בודקת `IF NOT EXISTS` וכוללת `UPDATE` כ-fallback, אבל צריך לוודא שהיא עובדת נכון עם האינדקס הייחודי על `user_id`

### שלב 3: יצירת סוכנות ברירת מחדל בטריגר התקין
- להעביר את לוגיקת יצירת הסוכנות מהטריגר השבור לתוך `handle_new_company_subscription`, כך שגם חברה וגם סוכנות ייווצרו אוטומטית

### פרטים טכניים
- מיגרציה חדשה: `DROP TRIGGER trigger_handle_new_company_with_agency ON companies`
- עדכון פונקציית `handle_new_company_subscription` לכלול יצירת סוכנות ברירת מחדל
- שינוי קטן: 1 קובץ מיגרציה חדש
