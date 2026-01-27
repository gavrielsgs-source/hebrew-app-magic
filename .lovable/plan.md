
# תיקון עמוד הקבלה - שורות התחלתיות וסדר RTL

## הבעיות שזוהו

### בעיה 1: רק מזומן מתחיל עם שורה
בקובץ `Receipt.tsx` שורות 93-101:
```typescript
const [payments, setPayments] = useState({
  cash: [{ amount: '', date: new Date() }],  // ✅ יש שורה
  check: [],          // ❌ ריק!
  credit_card: [],    // ❌ ריק!
  bank_transfer: [],  // ❌ ריק!
  other: [],          // ❌ ריק!
  tax_deduction: [],  // ❌ ריק!
  vehicle: [],        // ❌ ריק!
});
```

### בעיה 2: סדר השדות הפוך
כרגע השדות מוצגים משמאל לימין (LTR), אבל עבור עברית צריך מימין לשמאל (RTL).

## שינויים נדרשים

### קובץ 1: `src/pages/Receipt.tsx`
עדכון ה-state הראשוני כך שכל סוג תשלום יתחיל עם שורה אחת:

```typescript
const [payments, setPayments] = useState({
  cash: [{ amount: '', date: new Date() }],
  check: [{ amount: '', date: new Date(), accountNumber: '', branchNumber: '', bankNumber: '', checkNumber: '' }],
  credit_card: [{ amount: '', date: new Date(), lastFourDigits: '', expiryDate: '', cardType: '', idNumber: '', installments: 1 }],
  bank_transfer: [{ amount: '', date: new Date(), accountNumber: '', branchNumber: '', bankNumber: '' }],
  other: [{ amount: '', date: new Date(), paymentType: '' }],
  tax_deduction: [{ amount: '', date: new Date() }],
  vehicle: [{ amount: '', date: new Date(), licensePlate: '' }],
});
```

### קובץ 2: `src/components/receipt/PaymentTabContent.tsx`
תיקון סדר RTL בכל סוגי התשלומים:

1. שינוי שורת הכותרות ל-`flex-row-reverse` כדי שהסדר יהיה מימין לשמאל
2. שינוי שורת השדות ל-`flex-row-reverse` 
3. הזבל (כפתור מחיקה) יישאר בצד שמאל

לדוגמא, עבור העברות בנקאיות:
```typescript
// כותרות - מימין לשמאל
<div className="hidden md:flex md:flex-row-reverse gap-4 text-sm text-muted-foreground px-2">
  <span className="min-w-[120px]">תאריך</span>
  <span className="flex-1">מספר חשבון</span>
  <span className="w-28">מספר סניף</span>
  <span className="w-24">מספר בנק</span>
  <span className="w-24">סה"כ</span>
  <span className="w-10"></span>
</div>

// שדות - מימין לשמאל
<div className="flex flex-row-reverse items-center gap-4 ...">
  <Popover>...</Popover>  {/* תאריך - ראשון מימין */}
  <Input ... />           {/* מספר חשבון */}
  <Input ... />           {/* מספר סניף */}
  <Input ... />           {/* מספר בנק */}
  <Input ... />           {/* סה"כ */}
  <Button ... />          {/* זבל - אחרון משמאל */}
</div>
```

## סיכום השינויים

| קובץ | שינוי |
|------|-------|
| `src/pages/Receipt.tsx` | עדכון state ראשוני - כל סוג תשלום מתחיל עם שורה אחת |
| `src/components/receipt/PaymentTabContent.tsx` | הפיכת סדר השדות ל-RTL עם `flex-row-reverse` |

## תוצאה צפויה
- כל טאב יציג שורת תשלום מההתחלה (ללא צורך ללחוץ "הוסף תשלום")
- השדות יהיו מסודרים מימין לשמאל: תאריך ← מספר חשבון ← מספר סניף ← מספר בנק ← סה"כ ← 🗑️
