

## הוספת קוד הנחה "Cars40" — 40% הנחה למנוי שנתי בלבד

### ניתוח טכני — האם זה בטוח עם טרנזילה?
כן, זה בטוח לחלוטין. הסכום (`sum`) מחושב בצד הלקוח ונשלח ל-handshake ולאחריו ל-iframe. טרנזילה מחייבת את הסכום שמועבר אליה — אין בדיקה של "מחיר מקורי". כל מה שצריך זה לוודא שה-`sum` בהנדשייק שווה ל-`sum` באייפריים, מה שכבר קורה בקוד הקיים. ההנחה פשוט מפחיתה את הסכום לפני שליחתו לטרנזילה.

**אבטחה נוספת**: נוסיף וולידציה של קוד ההנחה גם ב-edge function של ה-handshake כדי שלא יוכלו לזייף קודים.

### שינויים נדרשים

**1. קובץ חדש: `src/utils/discount-codes.ts`**
- פונקציית עזר `validateDiscountCode(code, billingCycle)` שמחזירה אחוז הנחה
- קוד "Cars40" → 40% הנחה, רק כשה-billingCycle הוא "yearly"
- פונקציית `applyDiscount(sum, discountPercent)` לחישוב מחיר מוזל

**2. שינוי: `src/components/subscription/PaymentForm.tsx`**
- הוספת שדה "קוד הנחה" עם כפתור "החל"
- הצגת הודעת הצלחה/שגיאה (קוד לא תקין / רק למנוי שנתי)
- העברת ה-discount כ-callback ל-parent component
- הוספת prop `isYearly` ו-`onDiscountApplied`

**3. שינוי: `src/pages/UpgradeSubscription.tsx`**
- קבלת discount מ-PaymentForm
- חישוב `actualSum` עם ההנחה לפני שליחה ל-handshake
- העברת הסכום המוזל ל-TranzilaPaymentIframe
- הצגת המחיר המקורי והמוזל ב-DrawerHeader
- העברת קוד ההנחה ל-handshake לוולידציה server-side

**4. שינוי: `src/pages/Payment.tsx`**
- אותם שינויים כמו UpgradeSubscription — קבלת discount, חישוב סכום מוזל

**5. שינוי: `src/pages/SignupTrial.tsx`**
- הוספת שדה קוד הנחה בטופס ההרשמה (רק כשנבחר שנתי)
- חישוב סכום מוזל לפני handshake ו-iframe

**6. שינוי: `supabase/functions/tranzila-handshake/index.ts`**
- קבלת `discountCode` מה-body
- וולידציה server-side: אם נשלח קוד "Cars40" + billingCycle=yearly → לוודא שה-sum תואם את המחיר עם 40% הנחה
- דחיית בקשות עם סכום שלא תואם את הקוד

### איך זה עובד מבחינת המשתמש
1. בוחר חבילה + מחזור שנתי
2. ממלא פרטי תשלום
3. מזין "Cars40" בשדה קוד הנחה → לוחץ "החל"
4. רואה עדכון מיידי: ~~מחיר מקורי~~ → מחיר מוזל (40% הנחה)
5. אם בחר חודשי → הודעת שגיאה "קוד זה תקף רק למנוי שנתי"
6. ממשיך לתשלום — טרנזילה מחייבת את הסכום המוזל

### קבצים שישתנו
- `src/utils/discount-codes.ts` (חדש)
- `src/components/subscription/PaymentForm.tsx`
- `src/pages/UpgradeSubscription.tsx`
- `src/pages/Payment.tsx`
- `src/pages/SignupTrial.tsx`
- `supabase/functions/tranzila-handshake/index.ts`

