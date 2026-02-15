

# תיקון: PDF ריק בכל עמודי ייצור המסמכים

## הבעיה
שני PDF generators חסרים תיקונים קריטיים שגורמים ליצירת מסמכים ריקים.

## קבצים לתיקון

### 1. `src/utils/tax-invoice-receipt-pdf-generator.ts` -- חשבונית מס קבלה
**שתי בעיות:**
- האלמנט לא מתווסף ל-DOM (חסר `document.body.appendChild`)
- חסר `position: fixed` עם `opacity: 0`

התיקון: להוסיף את כל הסטיילים החסרים + `appendChild` + `removeChild` בסיום.

### 2. `src/utils/tax-invoice-pdf-generator.ts` -- חשבונית מס
**בעיה אחת:**
- האלמנט כן מתווסף ל-DOM אבל חסר `position: fixed` עם `opacity: 0`, מה שגורם לו להיות גלוי או מכוסה

התיקון: להוסיף את שורות ה-position fix אחרי שורת `backgroundColor`.

## פרטים טכניים

### שינויים ב-`tax-invoice-receipt-pdf-generator.ts`:
- הוספת סטיילים לאלמנט: `direction`, `width`, `padding`, `fontFamily`, `fontSize`, `color`, `backgroundColor`
- הוספת position fix: `position: fixed`, `top: 0`, `left: 0`, `zIndex: -9999`, `opacity: 0`
- הוספת `document.body.appendChild(element)` לפני יצירת ה-PDF
- הוספת `document.body.removeChild(element)` ב-finally

### שינויים ב-`tax-invoice-pdf-generator.ts`:
- הוספת 4 שורות אחרי שורה 15 (אחרי `backgroundColor`):
```text
element.style.position = 'fixed';
element.style.top = '0';
element.style.left = '0';
element.style.zIndex = '-9999';
element.style.opacity = '0';
```

