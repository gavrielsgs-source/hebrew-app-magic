

## תיקון פונקציית `admin_extend_subscription`

### הבעיה
כשמאריכים מנוי דרך ממשק האדמין, הפונקציה מעדכנת רק את `expires_at` אבל לא משנה את `subscription_status` ל-`active`. כתוצאה, משתמשים שהיו ב-`trial` או `expired` נשארים חסומים למרות שתאריך התפוגה הוארך.

### הפתרון
עדכון פונקציית `admin_extend_subscription` בבסיס הנתונים כך שה-UPDATE יכלול גם:
```sql
subscription_status = 'active'
```

שינוי יחיד בשורת ה-UPDATE הקיימת — הוספת `subscription_status = 'active'` ליד `expires_at` ו-`updated_at`.

### קובץ מושפע
- Database function: `admin_extend_subscription` (migration בלבד, ללא שינוי קוד Frontend)

