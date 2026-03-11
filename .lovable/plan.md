

## תיקונים נדרשים — 4 נושאים

### 1. קוד הנחה Cars40 — רק לביזנס ואנטרפרייז
כרגע הקוד עובד על כל 3 החבילות (premium, business, enterprise). צריך להגביל אותו לביזנס ואנטרפרייז בלבד.

**קבצים:**
- `src/utils/discount-codes.ts` — הוספת שדה `allowedPlans` לקוד ופרמטר `planId` לפונקציית `validateDiscountCode`
- `src/components/subscription/PaymentForm.tsx` — הוספת prop `selectedPlan` והעברתו לוולידציה
- `src/pages/UpgradeSubscription.tsx` — העברת `selectedPlan` ל-PaymentForm
- `src/pages/Payment.tsx` — אותו דבר
- `src/pages/SignupTrial.tsx` — אותו דבר
- `supabase/functions/tranzila-handshake/index.ts` — הוספת בדיקת plan מותר בצד שרת

### 2. לחיצה על משימה ביומן מובייל — שגיאה
כרגע `handleTaskClick` פותח `TaskNotifications` dialog. ככל הנראה הבעיה היא ב-`TaskNotifications` component שמקבל task ונכשל. הפתרון: במקום לפתוח notifications dialog, לפתוח את `EditTaskDialog` שכבר עובד בתוך `MobileTaskCalendar`. בעצם, ב-`MobileTaskCalendar` כבר יש `editingTask` state ו-`EditTaskDialog` — צריך לחבר את `onTaskClick` ל-`setEditingTask` במקום להעביר את הקליק ל-parent שפותח TaskNotifications.

**קבצים:**
- `src/components/tasks/MobileTaskCalendar.tsx` — שינוי `onClick` בתצוגת המשימות כך שיפתח את ה-EditTaskDialog המקומי במקום לקרוא ל-`onTaskClick`

### 3. טופס הוספת ליד — החזרת checkbox הודעה אוטומטית
- **דסקטופ** (`AddLeadForm.tsx`): ה-checkbox של שליחת הודעת WhatsApp אוטומטית הוסתר עם הערה "hidden - will be re-enabled later". צריך להחזיר אותו.
- **מובייל** (`MobileAddLeadForm.tsx`): במקום checkbox "קבע פגישה למחר" — להחליף ל-checkbox "שלח הודעת ברוכים הבאים בוואטסאפ". הפונקציונליות כבר קיימת — `addLead.mutateAsync` מקבל `sendWhatsApp` כפרמטר.

**קבצים:**
- `src/components/leads/AddLeadForm.tsx` — ביטול ההסתרה של checkbox WhatsApp (שורה 122)
- `src/components/leads/MobileAddLeadForm.tsx` — שינוי checkbox מ"קבע פגישה" ל"שלח הודעת ברוכים הבאים", שינוי `sendWhatsApp: false` ל-`sendWhatsApp: shouldScheduleMeeting` (עם rename למשתנה מתאים)

### 4. כפתורי פעולה בעמודי מסמכים נדרסים ע"י תפריט תחתון
כל עמודי הפקת המסמכים משתמשים ב-`fixed bottom-28` (~112px) לכפתורי הפעולה. התפריט התחתון גובהו ~70px + safe area. צריך להעלות את הכפתורים.

**שינוי:** בכל הקבצים הבאים, לשנות `bottom-28` ל-`bottom-36` (144px) כדי שיהיה מרווח מספיק:
- `src/pages/NewCarOrder.tsx` (שורה 396)
- `src/pages/PriceQuote.tsx` (שורה 598)
- `src/pages/Receipt.tsx` (שורה 560)
- `src/pages/TaxInvoiceReceipt.tsx` (שורה 756)
- `src/pages/TaxInvoiceCredit.tsx` (שורה 546)
- `src/pages/SalesAgreement.tsx` (שורה 546) — כאן `bottom-20`, לשנות ל-`bottom-36`

