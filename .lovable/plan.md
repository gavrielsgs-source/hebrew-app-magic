

## עיצוב קטלוג חיצוני בסגנון Buzz Catalogs

### תיקון 1: באנר בצבע המותג (לא שחור)
הבאנר בתחתית תמונת הרכב ישתמש ב-`brandColor` שהמנוי בוחר בהגדרות (כבר קיים כ-`primary_color` ב-`inventory_settings`), במקום שחור קבוע.

### תיקון 2: העלאת לוגו/תמונת כיסוי בהגדרות המלאי

כרגע ה-`logo_url` נשמר ב-`inventory_settings` אבל אין ממשק העלאה — המשתמש לא יכול להעלות לוגו. נוסיף:

**קבצים לשינוי:**

1. **`src/components/profile/InventorySettingsTab.tsx`**
   - הוספת רכיב העלאת לוגו (דומה ל-`CompanyLogoUpload` שכבר קיים) בתוך הגדרות התצוגה
   - העלאה ל-bucket `documents` (כבר public) בנתיב `{userId}/inventory-logo.{ext}`
   - עדכון `settings.logo_url` בזמן אמת — ללא צורך בלחיצת "שמור" נפרדת (ישמר עם שאר ההגדרות)
   - הוספת שדה `cover_image_url` להעלאת תמונת כיסוי ל-Hero (נתיב: `{userId}/cover-image.{ext}`)

2. **`src/pages/PublicInventory.tsx`**
   - כרטיסי רכב: הוספת באנר צבעוני (לפי `brandColor`) בתחתית התמונה עם שם הרכב
   - באדג' "במלאי" בפינה העליונה
   - לוגו הסוחר כ-watermark בפינת התמונה
   - פרטים טכניים: מגריד פילים לגריד 2 עמודות (שנה, נפח מנוע, יד, ק"מ, סוג מנוע, כוח סוס)
   - Hero: תמיכה ב-`cover_image_url` כרקע תמונה (עם fallback לגרדיאנט הנוכחי)

3. **`src/components/inventory/CarImageSlider.tsx`**
   - הוספת props חדשים: `brandColor`, `logoUrl`, `carName`
   - רינדור באנר צבעוני + watermark + באדג' סטטוס

4. **`src/components/inventory/CarDetailModal.tsx`** — עדכון קטן אם נדרש

5. **Edge Function `get-public-inventory`**
   - הוספת `company_logo_url` ל-select של profiles (כבר קיים בטבלה)
   - החזרת `cover_image_url` מתוך `inventory_settings`

### ללא מיגרציות
הכל נשמר ב-`inventory_settings` (JSONB) — לא צריך שינוי סכמה.

### סיכום
- באנר = צבע מותג (לא שחור)
- לוגו + תמונת כיסוי = העלאה ישירה מהגדרות המלאי
- עדכון מיידי בקטלוג

