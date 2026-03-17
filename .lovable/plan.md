

## תיקון — החזרת תגובת UI מיידית לטוגלים

### מה שבור
הסרנו את `setEnabled(checked)` מ-`handleEnabledChange` בתיקון הקודם. עכשיו הטוגל לא מגיב ויזואלית עד שה-DB מגיב — מה שנראה למשתמש כאילו הוא לא עובד.

### מה צריך לעשות
שינוי אחד בלבד בקובץ `InventorySettingsTab.tsx`:

**החזרת `setEnabled(checked)` ל-`handleEnabledChange`** (שורה 272-274):
```typescript
const handleEnabledChange = (checked: boolean) => {
  setEnabled(checked); // ← להחזיר את זה — תגובה מיידית ב-UI
  autoSaveToggle('inventory_enabled', checked);
};
```

אם השמירה נכשלת, `autoSaveToggle` כבר קורא ל-`fetchSettings()` ב-catch שמחזיר את הערך הנכון מה-DB.

### מה לא לגעת
כל שאר השינויים מהסיבוב הקודם (wrapper div שקורא ל-`handleEnabledChange`, הסרת `inventory_enabled` מ-`saveSettings`) — אלה תקינים ונשארים.

### קובץ מושפע
- `src/components/profile/InventorySettingsTab.tsx` — שורה אחת בלבד

