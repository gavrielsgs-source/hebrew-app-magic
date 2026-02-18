
# תיקון 3 בעיות בתצוגת הרכבים

## בעיה 1: Switch גולש מחוץ לגבולות (מע"מ / רכב משועבד)

### שורש הבעיה
ב-`StepFinancialInfo.tsx`, ה-`FormItem` של "רכב משועבד" מוגדר עם:
```
className="flex items-center gap-3 pt-8"
```
ה-`FormControl` עוטף את ה-`Switch` בלי `overflow-visible`, וזה גורם לעיגול הלבן (thumb) לצאת מחוץ לגבולות הקונטיינר.

### פתרון
להוסיף `overflow-visible` ל-`FormItem` של ה-Switch ולהפריד את ה-Label מה-`FormItem` לטיפול נכון יותר:

**ב-`StepFinancialInfo.tsx`** - שתי תיקונים:
1. Switch של מע"מ 18%: לעטוף ב-`div` עם `overflow-visible`
2. Switch של "רכב משועבד": להוסיף `overflow-visible` ל-`FormItem`

---

## בעיה 2: שלב "מידע נוסף" מגיש את הטופס אוטומטית

### שורש הבעיה
ב-`CarFormWizard.tsx` שורה 94-100:
```tsx
onSubmit={(e) => {
  e.preventDefault();
  e.stopPropagation();
  if (isLastStep) {
    form.handleSubmit(handleSubmit)();
  }
}}
```
כשמגיעים לשלב 4 (האחרון), כל לחיצה/Enter מפעיל `form.handleSubmit` **אוטומטית** כי `isLastStep === true`. אין כפתור "הבא" בשלב זה - הכפתור "שמור" הוא `type="submit"`, מה שגורם לטופס לשלוח מיד.

### פתרון
להוסיף `useState` נפרד `isReadyToSubmit` שמאפשר שמירה רק כשהמשתמש לוחץ **במפורש** על כפתור השמירה, ולא כשרק מגיעים לשלב האחרון.

**ב-`CarFormWizard.tsx`**:
- להסיר את ה-`onSubmit` מה-`form` לחלוטין (להשאיר `e.preventDefault()`)
- כפתור "שמור" ישנה ל-`type="button"` עם `onClick` מפורש שקורא ל-`form.handleSubmit(handleSubmit)()`
- כך השלב האחרון ישאר מוצג בלי לשלוח עד שלחיצה על "שמור"

---

## בעיה 3: לחיצה על שם הרכב בתצוגת טבלה לא פותחת כרטסת

### שורש הבעיה
ב-`CarsTable.tsx` שורה 73-75:
```tsx
<TableCell className="font-medium text-right py-5 px-8">
  {car.make} {car.model}
</TableCell>
```
אין `onClick` על התא - השם הוא טקסט רגיל ללא interactivity.

### פתרון
להפוך את שם הרכב ל-clickable שפותח את **דיאלוג הפרטים** (אותו דיאלוג שנפתח דרך כפתור "צפה"):

```tsx
<TableCell 
  className="font-medium text-right py-5 px-8 cursor-pointer hover:text-primary transition-colors"
  onClick={() => {
    setSelectedCar(car);
    setIsDetailsOpen(true);
  }}
>
  {car.make} {car.model}
</TableCell>
```

---

## קבצים לשינוי

1. **`src/components/CarsTable.tsx`** - הוספת `onClick` + `cursor-pointer` לתא שם הרכב
2. **`src/components/cars/wizard/CarFormWizard.tsx`** - שינוי כפתור "שמור" ל-`type="button"` עם `onClick` מפורש
3. **`src/components/cars/wizard/StepFinancialInfo.tsx`** - הוספת `overflow-visible` לקונטיינרים של Switch

---

## סיכום השינויים

| קובץ | שינוי |
|------|-------|
| `CarsTable.tsx` | תא שם רכב = clickable → פותח דיאלוג פרטים |
| `CarFormWizard.tsx` | כפתור שמור = `type="button"` עם `onClick` מפורש |
| `StepFinancialInfo.tsx` | `overflow-visible` לתיקון גלישת ה-Switch |
