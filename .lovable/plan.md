

## הוספת עמודת `max_leads` לטבלת subscriptions — override ללקוח ספציפי

### מה נעשה
נוסיף עמודה `max_leads` לטבלת `subscriptions` (בדיוק כמו `max_users` שכבר קיימת). כשהעמודה מכילה ערך — הוא ידרוס את ה-`leadLimit` של החבילה. כשהיא NULL — המערכת תמשיך לעבוד לפי החבילה הרגילה.

### שינויים

**1. מיגרציה — הוספת עמודת `max_leads`**
```sql
ALTER TABLE public.subscriptions ADD COLUMN max_leads integer DEFAULT NULL;
```

**2. `src/contexts/subscription-context.tsx`** (שורה ~147)
כרגע יש:
```ts
userLimit: subscriptionData.max_users || baseSubscription.userLimit
```
נוסיף באותו אופן:
```ts
leadLimit: subscriptionData.max_leads || baseSubscription.leadLimit,
userLimit: subscriptionData.max_users || baseSubscription.userLimit
```

**3. עדכון הלקוח הספציפי**
אחרי הפריסה, נעדכן ישירות דרך Supabase SQL Editor:
```sql
UPDATE subscriptions SET max_leads = <מספר> WHERE user_id = '<user-id>';
```

### איך להשתמש
בכל פעם שרוצים לשנות מגבלת לידים ללקוח ספציפי — פשוט לעדכן את `max_leads` בשורה שלו בטבלת `subscriptions`. אם הערך NULL — המערכת משתמשת במגבלת החבילה הרגילה.

### קבצים שישתנו
- מיגרציה חדשה (עמודת `max_leads`)
- `src/contexts/subscription-context.tsx` (שורה אחת)

