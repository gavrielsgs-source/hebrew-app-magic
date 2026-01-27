
# תיקון עמוד הקבלה - סדר טאבים ובעיית קלט

## הבעיות שזוהו

### בעיה 1: סדר הטאבים
לפי התמונה שצירפת, הסדר צריך להיות (מימין לשמאל בעברית):
- מזומן
- המחאות
- כרטיסי אשראי
- העברות בנקאיות
- אחר
- ניכוי מס במקור
- רכבים

הסדר הנוכחי כבר נכון! אבל צריך לוודא שהטאב הפעיל הראשוני הוא "מזומן" (כבר מוגדר כך).

### בעיה 2: לא ניתן להקליד בשדות
זוהתה הבעיה המרכזית - כאשר מקלידים מספר כמו "123":
1. מקלידים "1" - הערך הופך ל-`parseFloat("1")` = `1` (number)
2. השדה מציג את `(payment as any).amount` = `1`
3. מקלידים "2" - אבל ה-cursor קופץ כי ה-value השתנה

**הפתרון**: לשמור את הערכים הנומריים כמחרוזות (strings) בזמן ההקלדה, ולהמיר למספרים רק בחישוב הסיכומים.

## שינויים מתוכננים

### 1. עדכון ה-State הראשוני
במקום לאחסן `amount: 0` (number), נאחסן `amount: ''` (string):
```typescript
const [payments, setPayments] = useState<Record<PaymentType, { amount: string; date: Date; ... }[]>>({
  cash: [{ amount: '', date: new Date() }],
  ...
});
```

### 2. עדכון פונקציית addPayment
```typescript
const addPayment = (type: PaymentType) => {
  setPayments(prev => ({
    ...prev,
    [type]: [...prev[type], { amount: '', date: new Date() }]
  }));
};
```

### 3. עדכון כל שדות הקלט
במקום:
```typescript
onChange={(e) => {
  const value = e.target.value.replace(/[^0-9.]/g, '');
  updatePayment(type, index, 'amount', parseFloat(value) || 0);
}}
```

נעשה:
```typescript
onChange={(e) => {
  const value = e.target.value.replace(/[^0-9.]/g, '');
  updatePayment(type, index, 'amount', value);
}}
```

### 4. עדכון חישוב הסיכומים
במקום:
```typescript
cash: payments.cash.reduce((sum, p) => sum + (p.amount || 0), 0),
```

נעשה:
```typescript
cash: payments.cash.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
```

### 5. וידוא סדר הטאבים
הסדר במערך `PAYMENT_TABS` כבר נכון, אבל צריך לוודא שהתצוגה מותאמת ל-RTL (מימין לשמאל).

## קבצים שישתנו
- `src/pages/Receipt.tsx`

## סיכום טכני
- שינוי הטיפוס של `amount` מ-`number` ל-`string` בכל מקום
- עדכון כל ה-onChange handlers להעביר string במקום number
- עדכון `calculateTotals` להמיר strings ל-numbers
- עדכון `addPayment` ליצור תשלומים עם `amount: ''`
- עדכון ה-value binding ל-`payment.amount` ישירות (ללא `|| ''`)
