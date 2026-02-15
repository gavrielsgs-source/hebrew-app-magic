
# תיקון: החלפת Grow ב-Tranzila בפונקציית ביטול מנוי

## הבעיה
הפונקציה `cancel-subscription` עדיין משתמשת ב-Grow API (meshulam) לביטול חיובים חוזרים, למרות שכל מערכת התשלומים עברה ל-Tranzila.

## הפתרון
להסיר את כל הקוד של Grow ולהחליף בקריאה ל-Tranzila API לביטול חיוב חוזר.

## שינויים בקובץ `supabase/functions/cancel-subscription/index.ts`

### 1. הסרת כל ההפניות ל-Grow
- הסרת המשתנים `GROW_API_BASE`, `GROW_CLIENT_ID`, `GROW_EC_PWD` (שורות 9-11)
- הסרת שני הבלוקים של `cancelRecurringPayment` מול Grow (שורות 89-104 ושורות 131-147)

### 2. הוספת Tranzila API לביטול חיוב חוזר
- שימוש ב-`TRANZILA_SUPPLIER` ו-`TRANZILA_PW` (כבר מוגדרים כ-secrets)
- קריאה ל-Tranzila API לביטול עסקה חוזרת באמצעות ה-`payment_token` (שזה ה-`index` של העסקה ב-Tranzila שנשמר ב-webhook)

### 3. לוגיקת הביטול נשארת זהה
- Trial: ביטול מיידי + ביטול חיוב חוזר ב-Tranzila
- Active: סימון `cancel_at_period_end: true` + ביטול חיוב חוזר ב-Tranzila (כדי שלא יחויב שוב)

## פרטים טכניים

קובץ אחד לעדכון: `supabase/functions/cancel-subscription/index.ts`

שינויים עיקריים:
```text
// הסרה:
const GROW_API_BASE = 'https://sandbox.meshulam.co.il/api/light/server/1.0';
const GROW_CLIENT_ID = ...
const GROW_EC_PWD = ...

// הוספה:
const TRANZILA_SUPPLIER = Deno.env.get('TRANZILA_SUPPLIER');
const TRANZILA_PW = Deno.env.get('TRANZILA_PW');
```

ביטול חיוב חוזר ב-Tranzila ייעשה דרך קריאת API עם ה-`payment_token` (index של העסקה) שנשמר בטבלת subscriptions ע"י ה-`tranzila-webhook`.

הסודות `TRANZILA_SUPPLIER` ו-`TRANZILA_PW` כבר מוגדרים בפרויקט.
