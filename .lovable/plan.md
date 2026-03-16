
מה מצאתי:
1. זו לא תקלה אחת אלא 4 תקלות שונות של אותו סימפטום.
2. באוטומציות, במסד כרגע ההגדרות של המשתמש שלך נשמרו ככולן כבויות, ולכן גם לא נוצרו רשומות ב-`automation_queue`.
3. בתור האוטומציות כרגע אין בכלל פריטים, לכן ברור למה לא הגיע וואטסאפ.
4. במובייל של ההתראות יש בכלל UI מקומי בלבד (`useState`) בלי שמירה למסד, אז שם הסוויצ'ים לא יכולים להישמר.
5. במלאי יש ניסיון לעקוף race condition עם `lastSaveTimestamp`, אבל הוא נשמר ב-`useRef` מקומי ונאבד בכל remount של הטאב, ולכן הפתרון לא יציב.
6. בנוסף, קובץ ה-cron של האוטומציות נשען על placeholder של `YOUR_SERVICE_ROLE_KEY`, אז גם אחרי שנפתור את השמירה, צריך לוודא שהעיבוד התקופתי מוגדר נכון בפועל.

תוכנית תיקון:
1. לאחד את דפוס השמירה של כל מסכי ההגדרות:
   - טעינה ראשונית אחת מהשרת
   - עריכה לוקאלית יציבה
   - שמירה שמחזירה את הערך השמור מה-DB
   - עדכון ה-UI מהתגובה של השמירה, לא מ-refetch מאוחר

2. לתקן את אוטומציות:
   - `src/components/automations/AutomationSettingsTab.tsx`
   - `src/hooks/useAutomations.ts`
   - לשנות את ה-flow כך שהטופס יאותחל פעם אחת בלבד, ולא יידרס אחרי אינטראקציה.
   - ב-`save` להחזיר את הרשומה שנשמרה (`select().single()`), ולעדכן איתה גם את `form` וגם את cache של React Query.
   - לא להסתמך על invalidate בלבד כדי “להחזיר” state נכון.

3. לתקן את מלאי:
   - `src/components/profile/InventorySettingsTab.tsx`
   - להסיר את מנגנון ה-`lastSaveTimestamp` כפתרון מרכזי.
   - להעביר את המסך לאותו pattern יציב: hydrate פעם אחת, save מחזיר DB truth, ועדכון state ישירות מהתגובה.
   - אם צריך, להשאיר את תוכן הטאבים mounted (`forceMount`) כדי למנוע reset בין לשוניות.

4. לתקן את התראות:
   - `src/components/notifications/MobileNotificationSettings.tsx`
   - `src/hooks/use-push-notifications.ts`
   - כרגע במובייל ה-switchים של email/SMS הם דמה מקומית בלבד. צריך לחבר אותם לאותה שכבת preferences הקיימת במסד, או להסיר אותם זמנית עד שיש להם backend אמיתי.
   - לאחד בין desktop/mobile כדי שלא יהיו שני מקורות אמת שונים.

5. לבדוק את שרשרת הוואטסאפ מקצה לקצה:
   - `src/hooks/leads/use-create-lead.ts`
   - `supabase/functions/process-automation-queue/index.ts`
   - `supabase/migrations/20260312040000_automation_cron.sql`
   - אחרי תיקון השמירה, לוודא שיצירת ליד באמת מייצרת רשומת queue.
   - לוודא שה-processor רץ בפועל על הרשומות.
   - להוסיף לוגים ברורים לכל שלב: settings loaded, queue inserted, processor picked item, WhatsApp API result.

מה בדיוק אמומש:
- אחליף את דפוסי ה-`useEffect + setState + invalidateQueries` בדפוס deterministic.
- אאחד save flows כך שהתגובה מהשרת היא מקור האמת המיידי.
- אחבר/אאחד את מסך ההתראות במובייל עם ה-persistence האמיתי.
- אבדוק את ה-cron/processor ולא רק את ה-UI.

בדיקות שאבצע אחרי התיקון:
1. אוטומציות: להדליק “ברוכים הבאים”, לשמור, לעבור טאב, לחזור, לרענן, ולוודא שהכל עדיין דלוק.
2. מלאי: להדליק inventory, לשמור, לעבור טאב, לחזור, לרענן, ולוודא שנשמר.
3. התראות: להחליף סוויצ'ים, לרענן, ולוודא persistence אמיתי.
4. וואטסאפ end-to-end:
   - לשמור `welcome_enabled = true`
   - ליצור ליד חדש עם המספר שלך
   - לוודא שנכנסת רשומה ל-`automation_queue`
   - לוודא שה-processor עיבד אותה
   - לבדוק אם הסטטוס נהיה `sent` או `failed`
   - אם `failed`, לזהות אם הבעיה היא תבנית Meta / token / phone formatting / cron

פרטי טכני קצר:
- כרגע יש הוכחה שהבעיה אמיתית ולא רק ויזואלית:
  - `automation_settings` אצלך נשמרה במסד עם כל הערכים `false`
  - `automation_queue` ריק
  - `send-whatsapp-message` כן החזיר 200 לאחרונה, כלומר האינטגרציה עצמה כנראה לא מתה לגמרי
  - לכן השבר המרכזי כרגע הוא persistence + scheduling, ורק אחריו delivery

קבצים עיקריים לטיפול:
- `src/components/automations/AutomationSettingsTab.tsx`
- `src/hooks/useAutomations.ts`
- `src/components/profile/InventorySettingsTab.tsx`
- `src/components/notifications/MobileNotificationSettings.tsx`
- `src/hooks/use-push-notifications.ts`
- `src/pages/Profile.tsx`
- `src/hooks/leads/use-create-lead.ts`
- `supabase/functions/process-automation-queue/index.ts`
- `supabase/migrations/20260312040000_automation_cron.sql`
