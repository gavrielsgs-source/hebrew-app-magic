

# גישת שני שלבים: html2canvas + jsPDF

## הרעיון
במקום להסתמך על `html2pdf.js` שעוטף את שני הכלים (ולפעמים מפספס עיצוב), נשתמש ב-`html2canvas` ו-`jsPDF` ישירות בשני שלבים ברורים:

1. **שלב 1**: `html2canvas` מצלם את ה-HTML כתמונה (canvas)
2. **שלב 2**: `jsPDF` יוצר PDF ומכניס את התמונה לתוכו, כולל חלוקה אוטומטית לדפים

## יתרונות
- שליטה מלאה על כל שלב בנפרד
- התמונה שומרת את כל העיצוב כי html2canvas מצלם פיקסלים
- אין בעיית חיתוך -- אנחנו חותכים את התמונה לגובה A4 ומחלקים לדפים ידנית
- כבר מותקן בפרויקט, לא צריך להתקין שום דבר

## מה ישתנה
- קובץ אחד: `src/utils/pdf-helper.ts`

## פרטים טכניים

### הלוגיקה החדשה:
```text
1. יצירת iframe עם מידות A4 (794x1123px)
2. כתיבת ה-HTML לתוך ה-iframe
3. המתנה לטעינת פונטים ותמונות
4. html2canvas מצלם את ה-body של ה-iframe כ-canvas
5. חישוב כמה דפים צריך (גובה canvas / גובה A4)
6. לכל דף: חיתוך החלק המתאים מה-canvas והכנסה ל-jsPDF
7. שמירה / החזרת blob
```

### קוד מרכזי:
```text
// שלב 1: צילום
const canvas = await html2canvas(body, { scale: 2, windowWidth: 794 });

// שלב 2: יצירת PDF עם חלוקה לדפים
const pdf = new jsPDF('portrait', 'mm', 'a4');
const pageHeight = 297; // A4 height in mm
const imgWidth = 210;   // A4 width in mm
const imgHeight = (canvas.height * imgWidth) / canvas.width;
let position = 0;

while (position < imgHeight) {
  // חיתוך חלק מהתמונה לדף הנוכחי
  pdf.addImage(slice, 'JPEG', 0, 0, imgWidth, pageHeight);
  position += pageHeight;
  if (position < imgHeight) pdf.addPage();
}
```

### שמירת iframe:
- ה-iframe נשאר עם `opacity: 0.01` ומידות A4 כמו עכשיו
- מוחזר ל-`opacity: 1` לפני הצילום
- נמחק בסוף

