

## תיקון: תפריט תאריך ושעה יוצא מהמסך במובייל

### בעיה
ה-PopoverContent של בחירת התאריך מיושר ל-`align="end"` עם רוחב `w-auto`, מה שגורם ללוח השנה לגלוש מהמסך בצגים צרים. בנוסף, ה-PopoverContent הגלובלי מגדיר `w-80` שלא מתאים תמיד למובייל.

### פתרון

#### קובץ: `src/components/tasks/form/TaskDateAndStatus.tsx`
1. שינוי ה-PopoverContent של הלוח שנה:
   - `align="end"` → `align="center"` (מרכוז במקום יישור לקצה)
   - הוספת `w-auto max-w-[calc(100vw-2rem)]` למניעת גלישה מהמסך
   - הוספת `side="bottom"` לוודא שנפתח למטה

2. שינוי ה-SelectContent של שעות ודקות:
   - הוספת `position="popper"` ו-`sideOffset={4}` לשיפור מיקום
   - הוספת `max-w-[calc(100vw-2rem)]` למניעת גלישה

#### קובץ: `src/components/ui/popover.tsx`
- הוספת `max-w-[calc(100vw-2rem)]` לסגנון הבסיסי של PopoverContent כדי שאף פופאובר לא יגלוש מהמסך

שינויים ב-2 קבצים בלבד.

