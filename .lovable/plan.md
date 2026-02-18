
# תיקון Race Condition בדף PaymentSuccess

## הבעיה
כשהמשתמש מגיע ל-`/subscription/payment-success`, הדף קורא `refreshSubscription()` מיד. אבל ה-webhook של טרנזילה מגיע לשרת **בנפרד ובאיחור** - לכן יש סיכוי שכשהמשתמש מגיע לדף, ה-DB עדיין לא עודכן ו-`refreshSubscription()` מחזיר את המנוי הישן.

## הפתרון - Polling חכם

במקום לקרוא `refreshSubscription()` פעם אחת ולקוות לטוב, נוסיף polling שמנסה כל 2 שניות עד 10 ניסיונות (20 שניות סה"כ):

1. בדיקה ראשונה מיידית
2. אם המנוי עדיין לא עודכן - בדיקה נוספת כל 2 שניות
3. אחרי שהמנוי עודכן (status = 'active') - הצג הצלחה
4. אם אחרי 20 שניות עדיין לא עודכן - הצג הצלחה בכל מקרה (הטרנזקציה כבר הצליחה)

## שינויים טכניים

### קובץ יחיד לעדכון: `src/pages/PaymentSuccess.tsx`

שינוי ה-`useEffect` הנוכחי:

**לפני:**
```ts
useEffect(() => {
  const handleSuccess = async () => {
    try {
      setLoading(true);
      await refreshSubscription();
      toast.success('המנוי שודרג בהצלחה!');
    } catch (error) {
      ...
    } finally {
      setLoading(false);
    }
  };
  handleSuccess();
}, [refreshSubscription]);
```

**אחרי - Polling עד 10 ניסיונות:**
```ts
useEffect(() => {
  let attempts = 0;
  const MAX_ATTEMPTS = 10;
  const INTERVAL_MS = 2000;

  const pollSubscription = async () => {
    attempts++;
    await refreshSubscription();

    // בדיקה אם המנוי עודכן לפי ה-planId שבURL
    const currentStatus = subscription?.subscription_status;
    const currentTier = subscription?.tier;

    if (currentStatus === 'active' && currentTier === planId) {
      // הצלחה - המנוי עודכן
      setLoading(false);
      toast.success('המנוי שודרג בהצלחה!');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      // אחרי 20 שניות - סיים בכל מקרה
      setLoading(false);
      toast.success('התשלום התקבל! המנוי יתעדכן בקרוב.');
      return;
    }

    // ניסיון נוסף
    setTimeout(pollSubscription, INTERVAL_MS);
  };

  setLoading(true);
  pollSubscription();

  return () => { attempts = MAX_ATTEMPTS; }; // cleanup
}, []); // רק פעם אחת בטעינה
```

## תוספות UI

- **מחוון טעינה** עם טקסט "מאמת תשלום..." במקום loading spinner סתמי
- **progress bar** קטן שמציג את ההתקדמות עד לאישור
- אחרי אישור - כפתורי הניווט מופעלים

## קובץ לשינוי
- `src/pages/PaymentSuccess.tsx` - עדכון ה-useEffect עם polling + שיפור UI של מסך טעינה
