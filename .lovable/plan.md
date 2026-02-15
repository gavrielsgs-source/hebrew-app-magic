

# תיקון רינדור PDF -- שורה אחת שמשנה הכל

## הבעיה
בקובץ `src/utils/pdf-helper.ts` (שורות 14-19) ה-iframe נוצר ככה:
```text
width: 0
height: 0
visibility: hidden
```
דפדפן לא מחשב CSS layout לאלמנט בגודל 0. לכן html2canvas מצלם טקסט גולמי בלי עיצוב.

## הפתרון
שינוי 6 שורות בלבד בקובץ `src/utils/pdf-helper.ts`:

**מ:**
```text
iframe.style.position = 'fixed';
iframe.style.width = '0';
iframe.style.height = '0';
iframe.style.overflow = 'hidden';
iframe.style.border = 'none';
iframe.style.visibility = 'hidden';
```

**ל:**
```text
iframe.style.position = 'fixed';
iframe.style.left = '-9999px';
iframe.style.top = '0';
iframe.style.width = '794px';
iframe.style.height = '1123px';
iframe.style.border = 'none';
iframe.style.visibility = 'visible';
```

### למה זה עובד:
- `width: 794px` = רוחב A4 בפיקסלים ב-96dpi -- הדפדפן מחשב layout מלא
- `height: 1123px` = גובה A4
- `left: -9999px` = מחוץ למסך, המשתמש לא רואה
- `visibility: visible` = html2canvas חייב שהאלמנט יהיה visible כדי לצלם

## מה ישתנה
- קובץ אחד בלבד: `src/utils/pdf-helper.ts`
- שום קובץ אחר לא ישתנה

## התוצאה
כל 6 סוגי ה-PDF יקבלו את העיצוב המלא שלהם -- הצבעים, הטבלאות, הרקעים, הגבולות, הכל.
