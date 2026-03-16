

## ניתוח: למה הטוגל "מכבה את עצמו"

### שורש הבעיה

יש **3 מקומות** שמשנים את `enabled` בזיכרון, אבל רק **אחד** שומר ל-DB:

| קוד | שומר ל-DB? | מתי מופעל |
|-----|-----------|-----------|
| `handleEnabledChange` → `autoSaveToggle` | כן | לחיצה על ה-Switch עצמו |
| wrapper div `onClick` (שורה 460): `setEnabled(!current)` | **לא** | לחיצה על הטקסט/Label |
| `saveSettings` upsert (שורה 383) | כן — אבל עם ערך מקומי שעלול להיות שגוי | לחיצה על "שמור הגדרות" |

**תרחיש שגורם לבאג:**
1. הטוגל ON (נשמר נכון ל-DB)
2. משתמש משנה צבע/לוגו/טלפון
3. לוחץ "שמור הגדרות" → `saveSettings` עושה **upsert** שכולל `inventory_enabled` מהערך המקומי
4. אם בשלב כלשהו הוא לחץ על הטקסט (ולא על ה-Switch) — `enabled` התהפך מקומית בלי שמירה
5. ה-upsert שומר `false` ל-DB → הטוגל "נכבה"

**או תרחיש נוסף:**
- משתמש מפעיל טוגל ← נשמר
- עובר ללשונית אחרת בפרופיל ← הקומפוננטה **מתפרקת** (Radix Tabs unmount)
- חוזר ללשונית מלאי ← **mount מחדש** ← localStorage hydration ← `fetchSettings` רץ
- אם ה-fetch מחזיר `null` או ערך לא צפוי ← `parseBoolean(null, false)` → `false`

### תיקונים

**1. wrapper div — הסרת `onClick` / `onKeyDown` ישירים**
שורות 455-478: להחליף את `onClick={() => setEnabled(!current)}` ב-`onClick={() => handleEnabledChange(!enabled)}` — כך שלחיצה על הטקסט גם תשמור ל-DB.

**2. `saveSettings` — לא לכלול `inventory_enabled` ב-upsert**
שורות 377-388: להסיר את `inventory_enabled` מה-upsert של `saveSettings`, כך שרק `autoSaveToggle` שולט בשדה הזה. ה-upsert ישלח רק `inventory_slug` ו-`inventory_settings`.

**3. `handleEnabledChange` — להסיר `setEnabled` מיידי**
שורה 273: להסיר `setEnabled(checked)` — לתת ל-`applyProfileState` (שנקרא מ-`autoSaveToggle`) להיות המקור היחיד לעדכון state. זה מונע flicker ומצבים לא עקביים.

**4. fallback ב-`applyProfileState` — לא לאפס ל-false אם אין profile**
שורה 114: אם `profile` הוא `null`, לשמור את ערך ה-localStorage במקום לאפס ל-`false`.

### קבצים מושפעים
- `src/components/profile/InventorySettingsTab.tsx` בלבד (4 שינויים נקודתיים)

