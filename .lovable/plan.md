

# הבעיה: הפניה מיידית מ-Open Format לדשבורד

## סיבת הבעיה

ב-`OpenFormat.tsx` (שורות 16-20), יש `useEffect` שבודק `isAdmin()` ומפנה לדשבורד אם התוצאה היא `false`:

```typescript
useEffect(() => {
  if (!isAdmin()) {
    navigate("/dashboard");
  }
}, [isAdmin, navigate]);
```

הבעיה: `useRoles` טוען את הרולים מ-Supabase באופן אסינכרוני. בזמן הטעינה, `userRoles` הוא מערך ריק `[]`, ולכן `isAdmin()` מחזיר `false` **עוד לפני שהנתונים הגיעו**. זה גורם להפניה מיידית לדשבורד.

## התיקון

צריך לבדוק את `isLoading` מ-`useRoles` לפני קבלת החלטת הפניה. אם עדיין טוען -- מציגים מסך טעינה. רק אחרי שהטעינה הסתיימה ו-`isAdmin()` מחזיר `false`, מפנים לדשבורד.

## קובץ לעריכה

**`src/pages/OpenFormat.tsx`** -- שינוי אחד בלבד:

1. לייבא `isLoading` מ-`useRoles()`
2. להוסיף תנאי טעינה לפני ה-`useEffect` ולפני ה-render
3. לעדכן את ה-`useEffect` לבדוק `isLoading` קודם

```typescript
const { isAdmin, isLoading } = useRoles();

useEffect(() => {
  if (!isLoading && !isAdmin()) {
    navigate("/dashboard");
  }
}, [isAdmin, isLoading, navigate]);

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl">טוען הרשאות...</p>
    </div>
  );
}
```

אין צורך בשינויים נוספים. זה תיקון של שורה אחת בלוגיקה + הוספת מסך טעינה.

