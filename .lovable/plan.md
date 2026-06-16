# תכנית תיקון

## 1. סטטוסי לידים חדשים נכשלים בשמירה

**הסיבה:** ה-CHECK constraint על `public.leads.status` במסד מתיר רק:
`new, in_treatment, waiting, meeting_scheduled, handled, not_relevant`

הסטטוסים `no_answer`, `call_back`, `searching_specific_car` קיימים ב-UI (`QuickStatusChange`, `EditLeadStatusField`, `LeadsFilters`, `lead-status.tsx`) אבל ה-DB דוחה אותם → הופך לשגיאה בעדכון.

**התיקון:** מיגרציה שמרחיבה את ה-constraint:
```sql
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status = ANY (ARRAY[
    'new','in_treatment','waiting','meeting_scheduled',
    'handled','not_relevant','no_answer','call_back','searching_specific_car'
  ]));
```
ללא שינויי קוד נוספים.

## 2. לחיצה כפולה על משימה ביומן תפתח את פרטי המשימה המלאים

**מצב נוכחי:** לחיצה בודדת על משימה ב-`CalendarView` / `WeekView` / `SelectedDateTasks` / `AgendaView` / `DetailedDayView` קוראת ל-`onTaskClick` → `TasksPageContent.handleTaskClick` שפותח רק את דיאלוג ההתראות (`TaskNotifications`), בלי הפרטים שמולאו (לקוח, רכב, תיאור, תאריך וכו').

**התיקון (frontend בלבד):**

א. ב-`TasksPageContent.tsx`:
- להחליף את הדיאלוג של `TaskNotifications` בדיאלוג עריכה מלא שמשתמש ב-`EditTaskForm` (אותו טופס המשמש את `EditTaskDialog`), כך שכל הפרטים שמולאו מוצגים.
- להוסיף state `editingTask` נפרד ו-handler `handleTaskDoubleClick` שמציב אותו ופותח את הדיאלוג.
- `handleTaskClick` (לחיצה בודדת) יישאר לבחירה/הדגשה בלבד — לא יפתח את דיאלוג ההתראות באופן אוטומטי (מסיר את הבלבול הקיים).

ב. בקומפוננטות היומן להוסיף `onTaskDoubleClick` ולחבר `onDoubleClick` על כרטיס המשימה במקביל ל-`onClick` הקיים:
- `src/components/tasks/calendar/CalendarView.tsx` (כרטיסי המשימה בשורות ~199-225)
- `src/components/tasks/calendar/WeekView.tsx` (כרטיס משימה בשורה ~183)
- `src/components/tasks/calendar/SelectedDateTasks.tsx` (שורה ~77)
- `src/components/tasks/calendar/AgendaView.tsx` (שורה ~64)
- `src/components/tasks/calendar/DetailedDayView.tsx` (שורה ~203)
- `src/components/tasks/calendar/MobileTaskCalendarCard.tsx` — מובייל: לחיצה בודדת תפתח ישירות (אין double-click נוח במגע)
- העברה דרך `TaskCalendar.tsx` → `DesktopTasksView`/`MobileTasksView` → `TasksPageContent`

ג. שימוש חוזר ב-`EditTaskForm` הקיים בדיאלוג חדש (Dialog/Drawer לפי `isMobile`) — בלי לשכפל לוגיקה.

## טכני קצר
- מיגרציה אחת ל-Supabase.
- שינויי props (`onTaskDoubleClick?: (task) => void`) בשרשרת קומפוננטות היומן.
- דיאלוג עריכה חדש ב-`TasksPageContent` במקום (או לצד) דיאלוג ההתראות.
