

## תיקון טוגלים בלשונית אוטומציות — שמירה מיידית ל-DB

### הבעיה
כשלוחצים על טוגל (למשל "הודעת ברוכים הבאים"), הפונקציה `update()` רק מעדכנת state מקומי. השינוי לא נשמר ל-DB עד שלוחצים "שמור הגדרות". כשעוברים לשונית ומחזירים — הקומפוננטה עושה remount, קוראת מ-localStorage (שלא עודכן) או מה-DB (שלא עודכן), והטוגל חוזר למצב הקודם.

### הפתרון
כשמשנים טוגל (enabled/disabled) — לשמור מיד ל-DB. שדות טקסט ומספרים ימשיכו לדרוש לחיצה על "שמור".

### שינויים בקובץ אחד: `src/components/automations/AutomationSettingsTab.tsx`

1. **שינוי פונקציית `update`** — כשה-key הוא אחד מהטוגלים (`welcome_enabled`, `followup1_enabled`, `followup2_enabled`, `car_match_enabled`), מעדכנים state מקומי + localStorage מיד, ואז קוראים ל-`upsert.mutate` עם הטופס המעודכן כדי לשמור ל-DB.

2. **הלוגיקה**:
```typescript
const TOGGLE_KEYS = ['welcome_enabled', 'followup1_enabled', 'followup2_enabled', 'car_match_enabled'];

function update(key: keyof AutomationSettings, value: any) {
  const updated = { ...form, [key]: value };
  setForm(updated);
  localStorage.setItem("automation_settings_form", JSON.stringify(updated));
  
  // Auto-save toggles immediately to DB
  if (TOGGLE_KEYS.includes(key)) {
    upsert.mutate(updated);
  }
}
```

3. **הסרת `dirty` state** — כבר לא רלוונטי כי הטוגלים נשמרים מיד. כפתור "שמור הגדרות" נשאר לשדות טקסט/מספרים.

### קובץ מושפע
- `src/components/automations/AutomationSettingsTab.tsx` — פונקציית `update` בלבד

