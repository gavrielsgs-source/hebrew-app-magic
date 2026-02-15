
# תיקון סופי: הסרת height: 0 ו-overflow: hidden מכל ה-PDF generators

## הבעיה
בכל 6 קבצי ה-PDF יש שתי שורות שגורמות לדף ריק:
```
element.style.overflow = 'hidden';
element.style.height = '0';
```
html2canvas מצלם אלמנט בגובה 0 פיקסלים = דף לבן.

## הפתרון
הסרת 2 השורות האלה בלבד מכל קובץ. שום דבר אחר לא משתנה.

מה נשאר (וזה מספיק להסתיר מהמשתמש):
```
element.style.position = 'fixed';
element.style.top = '0';
element.style.left = '0';
element.style.zIndex = '-9999';
element.style.pointerEvents = 'none';
```

## 6 קבצים -- הסרת 2 שורות בכל אחד

1. **src/utils/pdf-generator.ts** -- שורות 27-28
2. **src/utils/receipt-pdf-generator.ts** -- שורות 23-24
3. **src/utils/price-quote-pdf-generator.ts** -- שורות 23-24
4. **src/utils/tax-invoice-pdf-generator.ts** -- שורות 21-22
5. **src/utils/tax-invoice-receipt-pdf-generator.ts** -- שורות 21-22
6. **src/utils/tax-invoice-credit-pdf-generator.ts** -- שורות 14-15

## מה לא משתנה
- כל ה-HTML templates המעוצבים נשארים כמו שהם
- ה-render delay נשאר
- position: fixed ו-zIndex: -9999 נשארים (מסתיר מהמשתמש)
- כל הלוגיקה של appendChild/removeChild נשארת
