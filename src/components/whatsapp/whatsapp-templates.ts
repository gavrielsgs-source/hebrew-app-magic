
export interface WhatsappTemplate {
  id: string;
  name: string;
  description: string;
  generateMessage: (car: any) => string;
}

export const whatsappTemplates: WhatsappTemplate[] = [
  {
    id: "basic",
    name: "תבנית בסיסית",
    description: "הודעה פשוטה עם פרטי הרכב הבסיסיים",
    generateMessage: (car: any) => `שלום,

רצינו לשתף אותך בפרטים על הרכב שהתעניינת בו:

*${car.make} ${car.model} ${car.year}*
מחיר: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
קילומטראז': ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'לא צוין'}
צבע: ${car.exterior_color || 'לא צוין'}
מנוע: ${car.engine_size || 'לא צוין'}
תיבת הילוכים: ${car.transmission || 'לא צוין'}
סוג דלק: ${car.fuel_type || 'לא צוין'}

נשמח לתאם לך ביקור ונסיעת מבחן!

בברכה,
צוות המכירות`
  },
  {
    id: "detailed",
    name: "תבנית מפורטת",
    description: "הודעה מפורטת עם כל הפרטים והמלצות",
    generateMessage: (car: any) => `שלום רב,

בהמשך לפנייתך, להלן פרטי הרכב המלאים:

🚗 *${car.make} ${car.model} שנת ${car.year}*

💰 *מחיר:* ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
🛣️ *ק"מ:* ${car.mileage ? `${car.mileage.toLocaleString()}` : 'לא צוין'}
🎨 *צבע:* ${car.exterior_color || 'לא צוין'}
🔧 *מנוע:* ${car.engine_size || 'לא צוין'}
⚙️ *תיבת הילוכים:* ${car.transmission || 'לא צוין'}
⛽ *סוג דלק:* ${car.fuel_type || 'לא צוין'}

✅ הרכב נמצא במצב מצוין ועבר את כל הבדיקות הנדרשות
✅ טסט לשנה
✅ טיפול אחרון בוצע לפני 5,000 ק"מ
✅ ספר טיפולים מלא
✅ ללא תאונות בעבר

אשמח לתאם לך ביקור לראות את הרכב ולצאת לנסיעת מבחן.
מה השעה שנוחה לך?

בברכה,
צוות המכירות`
  },
  {
    id: "promotion",
    name: "מבצע מיוחד",
    description: "הודעה עם הדגשת מבצע והנחה",
    generateMessage: (car: any) => `🔥 *הצעה מיוחדת* 🔥

שלום!

רצינו לעדכן אותך על מבצע מיוחד על הרכב שהתעניינת בו:

*${car.make} ${car.model} ${car.year}*
מחיר רגיל: ${car.price ? `₪${car.price.toLocaleString()}` : 'בהתאם להצעה'}
*מחיר מבצע: לפי פנייה* (הנחה מיוחדת!)

הרכב כולל:
✓ ${car.mileage ? `${car.mileage.toLocaleString()} ק"מ` : 'קילומטראז' נמוך'} בלבד
✓ צבע ${car.exterior_color || 'מעולה'}
✓ מנוע ${car.engine_size || 'חזק ויעיל'}
✓ ${car.transmission || 'תיבת הילוכים מעולה'}
✓ ${car.fuel_type || 'חסכוני בדלק'}
✓ אחריות יצרן בתוקף

המבצע בתוקף לזמן מוגבל!
נשמח לתאם לך ביקור ונסיעת מבחן.

בברכה,
צוות המכירות`
  }
];

// מייצא את התבניות הדיפולטיביות
export const defaultWhatsappTemplates = whatsappTemplates;
