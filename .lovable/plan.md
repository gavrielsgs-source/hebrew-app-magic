
# שדרוג כרטיס רכב - טופס מרובה שלבים (Wizard)

## סיכום
נהפוך את טופס הוספת/עריכת הרכב מטופס ארוך ושטוח לטופס מרובה שלבים (5 שלבים) עם עיצוב המערכת הקיימת שלנו. בנוסף, נוסיף שדות חדשים לטבלת `cars` ונוודא שהגבלת כרטיסי הרכב לפי חבילה סופרת רק רכבים פעילים (לא נמכרו/הוסרו).

## 5 השלבים

### שלב 1: מידע בסיסי
- **בעלים** - שדה חיפוש לקוח קיים + כפתור "לקוח חדש" (קישור ללקוח מטבלת customers)
- **תאריך כניסה** - קיים כבר
- **מספר רישוי** - קיים כבר
- **סוג** - שדה חדש: רגיל / בתיווך (radio buttons)

### שלב 2: פרטי הרכב
- יצרן ודגם (קיים, נשלב לשורה אחת)
- רמת גימור (קיים)
- שנה (קיים)
- תיבת הילוכים (קיים)
- סוג מנוע/דלק (קיים)
- נפח מנוע (קיים)
- מקוריות - שדה חדש (פרטי/ליסינג/השכרה/חברה)
- יד (קיים - ownership_history)
- קילומטראז' (קיים)
- צבע (קיים)
- טסט - תאריך (קיים - next_test_date)
- מספר שלדה (קיים)
- קוד דגם - שדה חדש
- מספר מנוע - שדה חדש

### שלב 3: מידע פיננסי
- **מחיר קניה** - קיים (purchase_cost)
- **מע"מ ששולם** - שדה חדש (סכום)
- **כפתור מע"מ על כל הסכום** - toggle שמחשב אוטומטית
- **מחיר דרישה** - שדה חדש (asking_price)
- **מחיר מינימלי** - שדה חדש (minimum_price)
- **מחיר מחירון** - שדה חדש (list_price)
- **סכום אגרת רישוי** - שדה חדש (registration_fee)
- **רכב משועבד** - שדה חדש (כן/לא)

### שלב 4: מידע נוסף
- **הצג בקטלוג החיצוני** - כן/לא (כשמסומן כן, הרכב מופיע בקטלוג הציבורי)
- **קוד דגם** - שדה חדש
- **הערות** - קיים (description)
- **מחיר לסוחר** - שדה חדש (dealer_price)
- **מחיר בקטלוג החיצוני** - שדה חדש (catalog_price)

### שלב 5: תמונות
- אזור drag & drop להעלאת תמונות (קיים, נשדרג עיצוב)
- הגבלה ל-PNG/JPG בלבד

---

## שינויים טכניים

### 1. עמודות חדשות בטבלת `cars` (SQL Migration)
```
car_type (text) - "regular" / "brokerage"
owner_customer_id (uuid, FK -> customers.id) - קישור לבעלים
origin_type (text) - מקוריות (private/leasing/rental/company)
model_code (text) - קוד דגם
engine_number (text) - מספר מנוע
vat_paid (numeric) - מע"מ ששולם
asking_price (numeric) - מחיר דרישה
minimum_price (numeric) - מחיר מינימלי
list_price (numeric) - מחיר מחירון
registration_fee (numeric) - אגרת רישוי
is_pledged (boolean) - רכב משועבד
show_in_catalog (boolean) - הצג בקטלוג
dealer_price (numeric) - מחיר לסוחר
catalog_price (numeric) - מחיר בקטלוג החיצוני
```

### 2. קומפוננטות חדשות
- `src/components/cars/wizard/CarFormWizard.tsx` - הקומפוננטה הראשית עם stepper
- `src/components/cars/wizard/StepBasicInfo.tsx` - שלב 1
- `src/components/cars/wizard/StepVehicleDetails.tsx` - שלב 2
- `src/components/cars/wizard/StepFinancialInfo.tsx` - שלב 3
- `src/components/cars/wizard/StepAdditionalInfo.tsx` - שלב 4
- `src/components/cars/wizard/StepImages.tsx` - שלב 5
- `src/components/cars/wizard/WizardStepper.tsx` - ה-stepper (עיגולים + קווים + שמות)

### 3. עדכון קבצים קיימים
- `src/components/cars/car-form-schema.ts` - הוספת שדות חדשים לסכמה
- `src/types/car.ts` - הוספת שדות חדשים ל-NewCar
- `src/hooks/cars/use-add-car.ts` - הוספת שדות חדשים ל-insert
- `src/hooks/cars/use-update-car.ts` - הוספת שדות חדשים ל-update
- `src/components/cars/forms/CarFormValues.ts` - עדכון default values
- `src/components/cars/AddCarForm.tsx` - שימוש ב-CarFormWizard במקום CarFormBase
- `src/components/cars/forms/EditCarForm.tsx` - שימוש ב-CarFormWizard במקום CarFormBase

### 4. תיקון ספירת כרטיסי רכב
כרגע הספירה מתבצעת על כל הרכבים (`cars?.length`). נשנה כך שתספור **רק רכבים פעילים** (status !== 'sold' && status !== 'removed') - כי אם רכב נמכר או הוסר, הוא לא תופס מקום במכסה.

### 5. קישור לקטלוג ציבורי
כשמשתמש מסמן "הצג בקטלוג החיצוני" = כן, דף הקטלוג הציבורי (`/inventory/:slug`) כבר מסנן לפי `status = 'available'`. נוסיף גם סינון לפי `show_in_catalog = true` כדי שרק רכבים שסומנו יופיעו.

### 6. עיצוב
- ה-Wizard ישתמש בעיצוב הקיים של המערכת (צבעי brand, כרטיסי shadcn, כפתורי "הבא"/"הקודם"/"ביטול"/"שמור")
- ה-Stepper יהיה בצורת עיגולים מחוברים בקווים עם שמות השלבים מתחת
- כל שלב בכרטיס נפרד
- כפתורי ניווט בתחתית: ביטול + הקודם (ימין), הבא/שמור (שמאל)
