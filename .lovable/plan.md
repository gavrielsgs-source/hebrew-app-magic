

## הבעיה

נכון, אתה צודק לגמרי. כרגע המערכת סופרת את **כל הלידים שנוצרו אי פעם** (`leads.length`) מול המגבלה, במקום לספור רק את הלידים שנוצרו **בחודש הנוכחי**. זה אומר שמשתמש עם חבילת Premium (מגבלה של 50 לידים) שצבר 50 לידים לאורך זמן - נחסם לנצח, גם אם החודש הזה הוא רק הוסיף 2.

## מה צריך לשנות

### 1. פונקציית ספירה חודשית (הליבה)
יצירת פונקציה חדשה שסופרת רק לידים שנוצרו מתחילת החודש הנוכחי. שני מקומות אפשריים:
- **אופציה א׳**: שאילתה נפרדת ב-Supabase שמסננת לפי `created_at >= first day of month`
- **אופציה ב׳**: סינון client-side מתוך הלידים שכבר נטענו

אני ממליץ על **אופציה ב׳** כי הלידים כבר נטענים עם `created_at`, וזה לא דורש שאילתה נוספת.

### 2. Hook חדש / פונקציה: `useMonthlyLeadCount`
פונקציית עזר שמחזירה את מספר הלידים שנוצרו החודש:

```text
function getMonthlyLeadCount(leads):
  startOfMonth = new Date(year, month, 1)
  return leads.filter(lead => lead.created_at >= startOfMonth).length
```

### 3. עדכון כל המקומות שבודקים מגבלת לידים
החלפת `leads.length` ב-`monthlyLeadCount` בכל הקבצים הרלוונטיים:

- **`src/pages/Leads.tsx`** — `checkEntitlement('leadLimit', leads.length + 1)` → `monthlyCount + 1`
- **`src/components/leads/grid/LeadsEmptyState.tsx`** — `currentLeadCount` 
- **`src/components/leads/page/LeadsPageHeader.tsx`** — `currentLeadCount`
- **`src/components/leads/table/LeadsTableHeader.tsx`** — הספירה שם
- **`src/components/leads/AddLeadForm.tsx`** — `checkAndNotifyLimit`
- **`src/components/subscription/SubscriptionLimitAlert.tsx`** — `currentCount`
- **`src/components/subscription/UsageBar.tsx`** — הצגת שימוש

### 4. עדכון UI של UsageBar/Alert
שהמשתמש יראה "5/50 לידים החודש" במקום "47/50 לידים" (שזה כולל את כל ההיסטוריה).

### קבצים לשינוי
- `src/pages/Leads.tsx`
- `src/components/leads/grid/LeadsEmptyState.tsx`
- `src/components/leads/page/LeadsPageHeader.tsx`
- `src/components/leads/table/LeadsTableHeader.tsx`
- `src/components/leads/AddLeadForm.tsx`
- `src/hooks/use-subscription-limits.ts` (אופציונלי — הוספת helper)
- `src/components/subscription/SubscriptionLimitAlert.tsx`

### מה לא ישתנה
- המגבלות עצמות בחבילות (`subscriptionFeatures`) — הן כבר נכונות
- מגבלות רכבים/משתמשים/חברות — אלה נשארות מצטברות (לא חודשיות)
- ה-`checkEntitlement` — הלוגיקה שלו נכונה, רק הערך שמועבר אליו צריך להשתנות

