

## תיקון: התאמת ליד לרכב — תיקון באג + הוספה לעדכון רכב

### הבעיה
1. **באג בסינטקס** ב-`use-add-car.ts`: הפילטר `.not('status', 'in', '("completed","cancelled")')` משתמש בגרשיים כפולים בתוך הסוגריים — PostgREST דורש סינטקס ללא גרשיים: `'(completed,cancelled)'`
2. **חסרה לוגיקת matching ב-`use-update-car.ts`** — כשמעדכנים רכב, אין בדיקה אם הרכב המעודכן תואם ללידים

### מה ישתנה

**1. `src/hooks/cars/use-add-car.ts`**
- תיקון שורה 103: שינוי הסינטקס מ-`'("completed","cancelled")'` ל-`'(completed,cancelled)'`
- הוספת `console.log` לדיבאג כדי לראות התאמות

**2. `src/hooks/cars/use-update-car.ts`**
- הוספת אותה לוגיקת matching אחרי עדכון מוצלח (אחרי שורה 71)
- שימוש בנתוני הרכב המעודכנים (`data`) לבדיקת התאמות מול לידים פעילים
- יצירת toast + notification לכל התאמה שנמצאת

### לוגיקת ה-matching (זהה בשני הקבצים)
```text
1. שליפת לידים עם interested_make תואם (ilike)
2. סינון לפי interested_model (אם קיים)
3. סינון לפי year range, max_price, max_km
4. לכל התאמה → toast + notification
```

