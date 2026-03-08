

## תוכנית: התראת התאמה בולטת — דיאלוג ייעודי במקום toast

### הבעיה
ה-toast של ההתאמה נבלע בין ה-toasts האחרים (הצלחת הוספת רכב וכו'), והמשתמש לא שם לב אליו.

### הפתרון
במקום toast רגיל, נציג **AlertDialog** בולט עם רקע ירוק/זהוב שמופיע מעל הכל כשנמצאת התאמה. הדיאלוג יציג את שם הליד, מה הוא מחפש, ולינק ישיר לעמוד הלידים.

### מה ישתנה

**1. קומפוננטה חדשה: `src/components/notifications/MatchAlertDialog.tsx`**
- AlertDialog עם אייקון 🎯 בולט
- מציג: שם ליד, רכב שנמצא, טלפון הליד
- כפתורים: "צפה בליד" (ניווט ל-/leads), "סגור"
- State גלובלי דרך React context או custom event

**2. מנגנון הפעלה — Custom Event**
- ב-`use-add-car.ts` וב-`use-update-car.ts`: במקום `toast.success`, נשלח `window.dispatchEvent(new CustomEvent('lead-match-found', { detail: matches }))`
- נשאיר את שמירת ה-notification בטבלה כמו שהיא
- נשאיר גם toast קצר לגיבוי

**3. `src/App.tsx` או `AppHeader.tsx`**
- הוספת ה-`MatchAlertDialog` שמאזין ל-custom event ומציג את הדיאלוג

### קבצים

| קובץ | שינוי |
|------|------|
| חדש: `MatchAlertDialog.tsx` | AlertDialog ייעודי להתאמות |
| `use-add-car.ts` | dispatch custom event + toast |
| `use-update-car.ts` | dispatch custom event + toast |
| `App.tsx` | הוספת MatchAlertDialog לlayout |

