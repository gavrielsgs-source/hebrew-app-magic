

## הוספת עמודת max_leads לממשק ניהול מנויים באדמין

### שינויים נדרשים

**1. `src/hooks/use-admin-subscriptions.ts`**
- הוספת `max_leads` ל-interface `AdminSubscription`
- וידוא שה-RPC `get_all_subscriptions` מחזיר את השדה (אם לא — צריך לעדכן את הפונקציה)

**2. `src/components/admin/SubscriptionTable.tsx`**
- הוספת עמודה "מגבלת לידים" בטבלה (אחרי עמודת "חבילה")
- הצגת הערך הנוכחי, או "ברירת מחדל" אם NULL
- הוספת כפתור "לידים" בפעולות שפותח dialog לעריכה

**3. קומפוננטה חדשה: `src/components/admin/ChangeLeadLimitDialog.tsx`**
- Dialog פשוט עם input מספרי ל-max_leads
- אפשרות "ברירת מחדל (לפי חבילה)" שמאפסת ל-NULL
- כפתור שמירה

**4. `src/hooks/use-admin-subscriptions.ts`**
- הוספת mutation `changeLeadLimit` שמעדכן ישירות את `subscriptions.max_leads` (UPDATE פשוט, לא צריך RPC חדש)

**5. בדיקת RPC `get_all_subscriptions`**
- צריך לוודא שהפונקציה מחזירה את `max_leads`. אם לא — נעדכן אותה.

### ייצוא לאקסל
- הוספת עמודת "מגבלת לידים" גם לייצוא Excel

