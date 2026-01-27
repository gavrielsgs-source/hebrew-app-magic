

# תיקון שדות הקלט בעמוד הקבלה

## הבעיה שזוהתה

הבעיה היא **מבנית** - הקומפוננטה `PaymentTabContent` מוגדרת **בתוך** פונקציית `Receipt()`. כל פעם שה-state משתנה (למשל כשמקלידים תו), הקומפוננטה נוצרת מחדש מאפס, וזה גורם ל:

1. ה-Input מאבד focus מיידית
2. אי אפשר להקליד יותר מתו אחד
3. התנהגות "תקועה" של השדות

```text
┌─────────────────────────────────────────────────────────┐
│                     Receipt()                           │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │  PaymentTabContent  <-- מוגדר בתוך Receipt!      │  │
│   │                                                  │  │
│   │  כל שינוי ב-state = קומפוננטה חדשה = אובד focus  │  │
│   └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## הפתרון

להוציא את `PaymentTabContent` מחוץ לקומפוננטת `Receipt` ולהעביר לה את הנתונים כ-props.

## שינויים נדרשים

### 1. הוצאת PaymentTabContent מחוץ לקומפוננטה

במקום להגדיר את הקומפוננטה בתוך `Receipt()`, נגדיר אותה מחוץ לפונקציה כקומפוננטה נפרדת:

```typescript
// מחוץ ל-Receipt (לפני הפונקציה)
interface PaymentTabContentProps {
  type: PaymentType;
  paymentList: { amount: string; date: Date; [key: string]: any }[];
  updatePayment: (type: PaymentType, index: number, field: string, value: any) => void;
  removePayment: (type: PaymentType, index: number) => void;
  addPayment: (type: PaymentType) => void;
}

const PaymentTabContent = ({ type, paymentList, updatePayment, removePayment, addPayment }: PaymentTabContentProps) => {
  // ... הלוגיקה הקיימת
};
```

### 2. עדכון השימוש בקומפוננטה

במקום:
```typescript
<PaymentTabContent type={tab.id} />
```

נשתמש ב:
```typescript
<PaymentTabContent 
  type={tab.id} 
  paymentList={payments[tab.id]}
  updatePayment={updatePayment}
  removePayment={removePayment}
  addPayment={addPayment}
/>
```

### 3. הוצאת SummaryCard גם כן

אותו הדבר עם `SummaryCard` - צריך להוציא אותה החוצה כדי למנוע re-renders מיותרים.

## קובץ שישתנה
- `src/pages/Receipt.tsx`

## סיכום טכני

| לפני | אחרי |
|------|------|
| PaymentTabContent מוגדר בתוך Receipt | PaymentTabContent מוגדר מחוץ ל-Receipt |
| כל הקלדה יוצרת קומפוננטה חדשה | הקומפוננטה נשארת יציבה |
| Input מאבד focus | Input שומר על focus |
| אי אפשר להקליד | הקלדה חופשית |

זה התיקון הנכון והסופי - הבעיה לא הייתה ב-string vs number, אלא במבנה הקומפוננטות עצמו.

