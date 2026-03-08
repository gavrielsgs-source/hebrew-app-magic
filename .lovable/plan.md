

## הבעיה

הלוגיקה הנוכחית של המע"מ שבורה:
- **כולל מע"מ = ON**: מחלץ מע"מ מהמחיר (נכון) — אבל הסה"כ לתשלום = מחיר נטו + מע"מ, כלומר הסכום נשאר אותו דבר
- **כולל מע"מ = OFF**: מתייחס לפריט כ"פטור ממע"מ" לגמרי — **שגוי**. צריך להוסיף מע"מ מעל המחיר

### מה צריך לקרות:
| מצב | משמעות | חישוב |
|------|---------|--------|
| כולל מע"מ ON | המחיר שהוזן כבר כולל מע"מ | סה"כ = המחיר כפי שהוזן, מע"מ מחולץ מבפנים |
| כולל מע"מ OFF | המחיר לפני מע"מ | סה"כ = המחיר + מע"מ 18% מעל |

## תוכנית תיקון

### קובץ: `src/pages/TaxInvoiceReceipt.tsx`

**1. תיקון חישוב ה-item total (שורות 215-234)**
- כשכולל מע"מ OFF: ה-total של הפריט נשאר `quantity * unitPrice - discount` (זה המחיר לפני מע"מ)
- כשכולל מע"מ ON: אותו דבר — ה-total הוא מה שהוזן (כבר כולל מע"מ)
- אין שינוי כאן, החישוב הבסיסי תקין

**2. תיקון `calculateFinancialSummary` (שורות 241-282)**
- `includeVat = true`: המחיר כולל מע"מ → חילוץ מע"מ מהמחיר, subtotal = נטו, totalAmount = המחיר המקורי
- `includeVat = false`: המחיר לפני מע"מ → subtotal = המחיר, מע"מ מתווסף מעל, totalAmount = המחיר + מע"מ

```
if (item.includeVat) {
  // מחיר כולל מע"מ - חילוץ
  netPrice = itemTotal / (1 + vatRate/100)
  vatPortion = itemTotal - netPrice
  subtotal += netPrice
  vatTotal += vatPortion
  // totalAmount will be subtotal + vat = itemTotal ✓
} else {
  // מחיר לפני מע"מ - הוספת מע"מ מעל
  subtotal += itemTotal
  vatToAdd = itemTotal * (vatRate/100)
  vatTotal += vatToAdd
  // totalAmount will be subtotal + vat = itemTotal + 18% ✓
}
```

**3. עדכון תצוגת הסיכום הכספי**
- הצגת "סה"כ לפני מע"מ" (subtotal) בבירור
- הצגת "מע"מ" (סכום המע"מ — בין אם חולץ או נוסף)
- הצגת "סה"כ לתשלום" (subtotal + vat)
- שינוי הלייבל של itemsWithoutVat ל-"פריטים + מע"מ נוסף" כדי שיהיה ברור

**4. עדכון ה-PDF** (`src/utils/pdf/tax-invoice-receipt-pdf.ts`)
- וידוא שה-PDF מציג את אותם נתונים שהחישוב מייצר
- הצגת שורת "כולל מע"מ" / "לפני מע"מ" ליד כל פריט

### לא נוגעים:
- סכמת הטופס (zod) — ללא שינוי
- מבנה הטפסים — ללא שינוי
- שליחה לוואטסאפ — כבר עובד
- שאר עמודי הפקת מסמכים — ללא שינוי

