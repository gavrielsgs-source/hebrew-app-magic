

# תוכנית: מחיקת כל הקוד הקשור ל-Tranzila

## סקירה
מחיקת כל הקבצים, הקוד, וההגדרות הקשורים לאינטגרציית Tranzila מהפרויקט.

## קבצים למחיקה מלאה
1. `supabase/functions/tranzila-handshake/` - Edge Function של ה-handshake
2. `supabase/functions/tranzila-webhook/` - Edge Function של ה-webhook
3. `src/components/subscription/TranzilaPaymentIframe.tsx` - קומפוננטת ה-iframe לתשלום

## קבצים לעריכה

### `supabase/config.toml`
- הסרת הבלוקים `[functions.tranzila-handshake]` ו-`[functions.tranzila-webhook]`

### `src/pages/UpgradeSubscription.tsx`
- הסרת ה-import של `TranzilaPaymentIframe`
- הסרת ה-state של `tranzilaData` וכל השימוש בו
- הסרת הקריאה ל-`supabase.functions.invoke('tranzila-handshake', ...)`
- הסרת ה-JSX שמציג את `TranzilaPaymentIframe`
- הפונקציה `onSubmit` תציג הודעה זמנית שהתשלום אינו זמין כרגע (או שנשאיר רק את טופס פרטי התשלום בלי הגשה בפועל)

### `.lovable/plan.md`
- ניקוי תוכן הקובץ (הוא מתייחס לתוכנית שיתוף מסמכים, לא ל-Tranzila, אז נשאיר אותו כמו שהוא)

## Edge Functions שיימחקו מ-Supabase
- `tranzila-handshake`
- `tranzila-webhook`

## מה לא ישתנה
- כל שאר מנגנון המנויים (subscription context, plan cards, billing toggle)
- טבלאות בדאטאבייס (subscriptions, payments וכו') - נשארות כמו שהן
- כל שאר המערכת

## פרטים טכניים
- ב-`UpgradeSubscription.tsx`, פונקציית `onSubmit` תוחלף בהודעת toast: "מערכת התשלומים אינה פעילה כרגע"
- ה-Drawer יציג רק את `PaymentForm` ללא אפשרות מעבר ל-iframe

