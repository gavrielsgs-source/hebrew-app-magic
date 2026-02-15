
# תיקון: ביטול חיוב חוזר ב-Grow גם למנויים פעילים

## הבעיה
כשמשתמש עם מנוי פעיל (active) לוחץ "בטל מנוי", הקוד מסמן את המנוי כ-`cancel_at_period_end: true` אבל **לא מבטל את ההוראת חיוב החוזרת ב-Grow**. כתוצאה מכך, Grow ימשיך לחייב את הלקוח בתאריך החיוב הבא.

## הפתרון
עדכון ה-Edge Function `cancel-subscription` כך שגם עבור מנויים פעילים (לא רק trial), יבוצע ביטול החיוב החוזר מול Grow API.

## שינויים

### קובץ: `supabase/functions/cancel-subscription/index.ts`
בבלוק ה-`else` (ביטול בסוף תקופת חיוב), להוסיף קריאה ל-`cancelRecurringPayment` של Grow -- אותה קריאה שכבר קיימת בבלוק ה-trial:

```text
לפני:
  else {
    // Cancel at end of billing period
    UPDATE subscriptions SET cancel_at_period_end = true
    // (לא מבטל ב-Grow)
  }

אחרי:
  else {
    // Cancel at end of billing period
    UPDATE subscriptions SET cancel_at_period_end = true
    // ביטול החיוב החוזר ב-Grow כדי שלא יחויב שוב
    if (subscription.recurring_payment_id) {
      cancelRecurringPayment with Grow API
    }
  }
```

## פרטים טכניים
- קובץ אחד לעדכון: `supabase/functions/cancel-subscription/index.ts`
- להעתיק את בלוק ביטול ה-Grow (שורות 89-104) גם לבלוק ה-else (שורות 117+)
- הביטול ב-Grow מבטיח שהלקוח לא יחויב שוב, והמנוי ימשיך לעבוד עד סוף התקופה הנוכחית
