
# תיקון סנכרון כרטסת רכב - לקוח ומסמכים

## הבעיות הנוכחיות

### בעיה 1: שיוך לקוח לא מתעדכן אוטומטית
כשעורכים רכב ושומרים (`EditCarForm` → `useUpdateCar`), מתבצע:
```
queryClient.invalidateQueries({ queryKey: ["cars"] })
```
זה מרענן את רשימת הרכבים, אבל ה-`Dialog` בטבלה עדיין מחזיק את ה-`selectedCar` הישן (ה-object הישן עם `owner_customer_id` הקודם).

ה-`CarDetails` מקבל `car` כ-prop ולא מקשיב לשינויים ב-cache — כך שהטאב "מוכר וקונה" מציג מידע ישן עד שסוגרים ופותחים מחדש.

**פתרון:**
- ב-`CarsTable.tsx`: לקרוא ל-`useCars()` ולגזור את הרכב הנבחר מהנתונים המעודכנים עם `useMemo` לפי `selectedCar.id` — כך כשה-cache מתרענן, הרכב בדיאלוג מקבל אוטומטית את הנתונים החדשים.
- ב-`useUpdateCar.ts`: להוסיף גם `invalidateQueries({ queryKey: ["customer"] })` כך שהמידע בטאב הלקוח יתרענן.

### בעיה 2: מסמכים לא מסתנכרנים
`CarDocumentsTab` משתמש ב-`useDocuments("car", carId)` שמביא רק מסמכים מטבלת `documents` עם `entity_type='car'` ו-`entity_id=carId`.

**הבעיה:** מסמכים שנוצרים מחוץ לזרימת "רכב" (למשל מסמך שנוצר ממסך לקוח) לא יופיעו, כי ה-`entity_type` שלהם הוא `'customer'` ולא `'car'`.

**פתרון:**
- לוודא שמסמכים שנוצרים עם `entity_type='car'` מבוצעים עם `invalidateQueries` כדי שטאב המסמכים מתרענן מייד.
- ב-`useUpdateCar.ts`: להוסיף `invalidateQueries({ queryKey: ["documents", "car", id] })` כך שאחרי עדכון רכב, רשימת המסמכים מתרענן.
- ב-`CarDetails.tsx`: להוסיף `key={car.id}` ל-Tabs כדי לאפס את הקומפוננט כשמחליפים רכב.

## קבצים לשינוי

### 1. `src/components/CarsTable.tsx`
גזירת `currentSelectedCar` מהרשימה החיה לפי `selectedCar?.id`:

```tsx
// הוספה:
const currentSelectedCar = selectedCar
  ? cars.find(c => c.id === selectedCar.id) ?? selectedCar
  : null;

// בדיאלוגים: שימוש ב-currentSelectedCar במקום selectedCar
<CarDetails car={currentSelectedCar} />
<EditCarForm car={currentSelectedCar} ... />
```

כך ברגע שה-`cars` query מתרענן, הרכב שמוצג בדיאלוג עדכני אוטומטית.

### 2. `src/hooks/cars/use-update-car.ts`
הוספת invalidation נוספים ב-`onSuccess`:

```tsx
onSuccess: (data, variables) => {
  queryClient.invalidateQueries({ queryKey: ["cars"] });
  queryClient.invalidateQueries({ queryKey: ["customer"] });
  queryClient.invalidateQueries({ queryKey: ["documents", "car", variables.id] });
},
```

### 3. `src/components/cars/CarDetails.tsx`
הוספת `key={car.id}` ל-Tabs לאיפוס מצב כשמחליפים רכב:

```tsx
<Tabs key={car.id} defaultValue="general" className="w-full">
```

## סיכום

| בעיה | שורש | פתרון |
|------|-------|--------|
| לקוח לא מתעדכן בדיאלוג | `selectedCar` הוא object ישן | גזירת הרכב מ-cache החי לפי ID |
| מסמכים לא מתרענן | אין `invalidateQueries` לאחר עדכון | הוספת invalidation ל-`documents` |
| Dialog מציג מידע ישן | אין `key` prop לאיפוס | הוספת `key={car.id}` ל-Tabs |
