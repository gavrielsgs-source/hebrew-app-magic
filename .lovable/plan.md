
## הוספת יצירת משתמש ידנית מתוך פאנל האדמין

### מה נבנה
כפתור חדש בלשונית "הזמנות משתמשים" (או בלשונית חדשה) שמאפשר לך כאדמין ליצור משתמש חדש עם אימייל וסיסמה שאתה בוחר. המשתמש יקבל אוטומטית מנוי ניסיון ל-14 ימים.

### איך זה עובד

1. **בפאנל האדמין** - כפתור "צור משתמש חדש" שפותח דיאלוג עם שדות: אימייל, סיסמה, שם מלא (אופציונלי)
2. **Edge Function חדשה** (`admin-create-user`) - יוצרת את המשתמש דרך Supabase Admin API (service role key)
3. המשתמש נוצר עם אימייל מאומת מראש (בלי צורך באישור מייל)
4. הטריגר הקיים `handle_new_user_subscription` יוצר אוטומטית מנוי ניסיון ל-14 ימים

### שינויים טכניים

**1. Edge Function חדשה: `supabase/functions/admin-create-user/index.ts`**
- מאמתת שהקורא הוא אדמין (דרך `is_admin()`)
- משתמשת ב-`SUPABASE_SERVICE_ROLE_KEY` ליצירת משתמש דרך `supabase.auth.admin.createUser()`
- מגדירה `email_confirm: true` כדי לדלג על אימות מייל
- מעבירה `full_name` ב-`user_metadata`

**2. הגדרת config.toml**
- הוספת `[functions.admin-create-user]` עם `verify_jwt = false` (אימות בקוד)

**3. קומפוננטה חדשה: `src/components/admin/AdminCreateUser.tsx`**
- דיאלוג עם טופס: אימייל, סיסמה, שם מלא
- קורא ל-edge function `admin-create-user`
- מציג הודעת הצלחה/שגיאה

**4. עדכון `src/components/admin/AdminUserInvitations.tsx`**
- הוספת כפתור "צור משתמש" ליד כפתור "שלח הזמנה"

### אבטחה
- ה-Edge Function בודקת הרשאות אדמין בצד השרת
- סיסמאות לא נשמרות בלוגים
- רק אדמין יכול לגשת לפונקציה
