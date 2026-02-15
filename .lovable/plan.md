
# תיקון מנויים במסד הנתונים

## מה קרה
- המשתמש `itscarslead@gmail.com` ביצע תשלום מוצלח של 199 ש"ח
- בטעות עדכנו את המנוי של `gavrielName@outlook.co.il` במקום של `itscarslead@gmail.com`
- צריך לתקן את שני המנויים

## מה צריך לעשות

### שלב 1: עדכון המנוי של itscarslead@gmail.com לפעיל
עדכון הרשומה של user_id `4588e0ff-3cb1-40e6-b301-635da14d8e60`:
- subscription_status: 'active'
- subscription_tier: 'premium'  
- billing_amount: 199
- billing_cycle: 'monthly'
- expires_at: עוד חודש מעכשיו
- next_billing_date: עוד חודש מעכשיו
- active: true

### שלב 2: החזרת המנוי של gavrielName@outlook.co.il למצב הקודם
עדכון הרשומה של user_id `816dd11c-344a-43c6-8bcb-b91defb5c62d`:
- subscription_status: 'expired' (מצב קודם - trial פג)
- active: true (כמו שהיה)
- billing_amount: null
- expires_at: null
- next_billing_date: null

### שלב 3: הוספת רשומה לhistory
הוספת רשומת תשלום מוצלח ל-payment_history עבור itscarslead.

---

## פרטים טכניים

### מיגרציה SQL
קובץ מיגרציה חדש שמבצע:
1. UPDATE על subscriptions עבור itscarslead (user_id: 4588e0ff...) - הפעלת מנוי premium
2. UPDATE על subscriptions עבור gavrielName (user_id: 816dd11c...) - החזרה למצב expired
3. INSERT ל-payment_history עבור itscarslead - תיעוד התשלום המוצלח

### הערה חשובה
תיקון הקוד שהעברנו (userId prop) כבר פעיל - כל תשלום עתידי יעדכן אוטומטית את המנוי ללא צורך בהתערבות ידנית. דף payment-success כבר קורא ל-refreshSubscription שמרענן את הנתונים בצד הלקוח.
