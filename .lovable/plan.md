

# תיקון: העברת userId ל-Webhook של טרנזילה

## הבעיה
כשמשתמש משלם דרך טרנזילה, התשלום עובר בהצלחה אבל ה-webhook שמעדכן את המנוי נכשל כי הוא לא מקבל את ה-`userId`. זה קורה כי הדף `UpgradeSubscription.tsx` לא מעביר את ה-`userId` לקומפוננטת ה-iframe.

## התוצאה
- התשלום נגבה מהלקוח
- המנוי לא מתעדכן
- המשתמש נשאר חסום

## הפתרון

### שלב 1: העברת userId ל-iframe
בקובץ `src/pages/UpgradeSubscription.tsx`, להוסיף את `userId` מה-`useAuth` hook לקומפוננטת `TranzilaPaymentIframe`.

### שלב 2: תיקון ידני למנוי של gavrielName@outlook.co.il
התשלום האחרון (199 שח, ConfirmationCode: 2623311) עבר בהצלחה אבל המנוי לא עודכן. צריך לעדכן את המנוי ידנית ב-DB.

---

## פרטים טכניים

### קובץ: `src/pages/UpgradeSubscription.tsx`
- לייבא את `useAuth` hook
- להוציא את `user` מה-hook
- להוסיף `userId={user?.id}` בקריאה ל-`TranzilaPaymentIframe` (שורה 154)

### תיקון DB ידני
עדכון המנוי של המשתמש שביצע תשלום מוצלח (gavrielName@outlook.co.il) - לשנות סטטוס ל-active, לעדכן tier ותאריכי תוקף.

