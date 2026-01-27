
# תיקון מחולל ה-PDF לקבלות

## הבעיה שזוהתה

ה-PDF יוצא ריק כי ה-HTML ב-`receipt-pdf-generator.ts` שונה ממחוללי ה-PDF האחרים במערכת:

1. **חסר מבנה HTML מלא** - אין `<!DOCTYPE html>`, `<head>`, `<style>`, `<body>`
2. **מיקום בעייתי** - האלמנט ממוקם ב-`left: -9999px` שעלול לגרום לבעיות ב-html2canvas
3. **סגנונות inline במקום CSS classes** - פחות יציב לרינדור PDF

## ההבדל בין מחוללי ה-PDF שעובדים לזה שלא עובד

### מה שעובד (tax-invoice-receipt-pdf-generator.ts):
```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; ... }
    .header { ... }
  </style>
</head>
<body>
  <div class="header">...</div>
</body>
</html>
```

### מה שלא עובד (receipt-pdf-generator.ts):
```html
<div dir="rtl" style="font-family: ...">
  <!-- Header -->
  <div style="...">
</div>
```

## הפתרון

לשכתב את `createReceiptPDFHTML` כדי שייצור HTML מלא כמו שאר המחוללים במערכת, כולל:

1. **מבנה HTML מלא** - עם DOCTYPE, html, head, body
2. **CSS במקום inline styles** - יותר יציב
3. **עיצוב מודרני** - בסגנון שאר המסמכים במערכת (סגול/gradient)

## קובץ שישתנה
- `src/utils/receipt-pdf-generator.ts`

## התוצאה הצפויה

PDF מעוצב ויפה שכולל:
- כותרת עם מספר קבלה ותאריך
- פרטי חברה ופרטי לקוח בשתי עמודות
- טבלת תשלומים עם כותרות צבעוניות
- סיכום כספי עם gradient סגול
- הערות (אם יש)
- פוטר עם שם החברה

## פרטים טכניים

1. **שינוי פונקציית generateReceiptPDF**:
   - הסרת `position: absolute` ו-`left: -9999px`
   - הוספת סגנונות כמו ב-price-quote-pdf-generator

2. **שינוי createReceiptPDFHTML**:
   - הוספת DOCTYPE, html, head עם charset
   - הוספת בלוק `<style>` עם classes
   - שימוש ב-classes במקום inline styles
   - עיצוב תואם לשאר המסמכים
