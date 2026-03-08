

## הוספת קישור הדרכה YouTube לאימייל Welcome

שלושה שינויים קטנים בשלושה קבצים — בלי לשבור שום דבר:

### שינוי 1 — Welcome Email Template
**קובץ:** `supabase/functions/_shared/email-templates/welcome-email.tsx`
- הוספת prop `tutorialLink` (עם default לקישור הפלייליסט)
- הוספת סקשיין חדש בין כפתור "היכנס למערכת" לבין "מידע חשוב":
  - כותרת: "🎬 צפה בהדרכה וגלה את כל האפשרויות"
  - טקסט: "הכנו לך סדרת הדרכות קצרה שתעזור לך להתחיל במהירות"
  - כפתור ירוק בולט "▶ צפה בהדרכה" שמוביל לקישור YouTube
  - עיצוב highlight box ירוק שבולט מתוך האימייל

### שינוי 2 — Edge Function
**קובץ:** `supabase/functions/send-email/index.ts`
- הוספת `tutorialLink` ל-interface של `EmailRequest.data`
- העברת ה-prop ל-`WelcomeEmail` component ב-case של welcome

### שינוי 3 — RegisterForm
**קובץ:** `src/components/auth/RegisterForm.tsx`
- הוספת `tutorialLink` לאובייקט ה-data בקריאה ל-`send-email` (שורה ~138)
- הקישור: `https://youtube.com/playlist?list=PL_34QQHEpbtSlkcAuREn2F5L5OzR4SeT-&si=Ba-WcEFghFfqh8up`

### מה לא משתנה
- כל שאר האימייל נשאר בדיוק כמו שהוא
- תהליך ההרשמה לא משתנה
- אף template אחר לא מושפע

