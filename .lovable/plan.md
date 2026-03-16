

## תיקון ריאקטיביות הטוגלים בחשבונית מס קבלה

### הבעיה
`form.watch()` (שורה 175) מחזיר ערכים אבל לא תמיד גורם ל-re-render כשמשנים שדה מקונן במערך (כמו `items.0.includeVat`). לכן התצוגה המקדימה לא מתעדכנת מיד כשמכבים/מדליקים את טוגל המע"מ.

### הפתרון

**קובץ: `src/pages/TaxInvoiceReceipt.tsx`**

1. **החלפת `form.watch()` ב-`useWatch`** — ייבוא `useWatch` מ-`react-hook-form` ושימוש ב-`useWatch({ control: form.control })` במקום `form.watch()` בשורה 175. זה מבטיח re-render בכל שינוי, כולל שדות מקוננים במערכים.

2. **הוספת `shouldDirty: true`** לקריאת `form.setValue` בטוגל המע"מ (שורה 713) וב-useEffect שמחשב total (שורה 238), כדי להבטיח שהשינוי מזוהה ע"י react-hook-form.

שלושה שינויים בלבד:
- שורה 2: הוספת `useWatch` לייבוא
- שורה 175: `const watchedFields = useWatch({ control: form.control });`
- שורה 238: הוספת `{ shouldDirty: true, shouldValidate: false }`
- שורה 713: הוספת `{ shouldDirty: true }` ל-setValue

