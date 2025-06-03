
export interface WhatsappLeadTemplate {
  id: string;
  name: string;
  description: string;
  generateMessage: (leadName: string, leadSource?: string) => string;
}

export const whatsappLeadTemplates: WhatsappLeadTemplate[] = [
  {
    id: "friendly_intro",
    name: "הכרות ידידותית",
    description: "הודעה חמה ופתוחה לפתיחת שיחה",
    generateMessage: (leadName: string, leadSource?: string) => `שלום ${leadName}! 😊

איך שלומך? אני ${leadSource ? `בעקבות הפנייה שלך ב${leadSource}` : 'מהצוות שלנו'} ורציתי ליצור איתך קשר.

האם זה זמן נוח לשיחה קצרה על המכונית שאתה מחפש?

נשמח לעזור לך למצוא בדיוק מה שמתאים לך! 🚗

בברכה,
צוות המכירות`
  },
  {
    id: "professional_intro",
    name: "הצגה מקצועית",
    description: "הודעה עסקית ופרקטית",
    generateMessage: (leadName: string, leadSource?: string) => `שלום ${leadName},

אני פונה אליך מצוות המכירות של חברת הרכב שלנו.
${leadSource ? `קיבלנו את פרטיך דרך ${leadSource}` : 'אנו מעוניינים לעזור לך'} ורצינו לברר איך נוכל לסייע לך.

נשמח לשמוע מה המפרט שאתה מחפש ולהציע לך את הפתרונות הטובים ביותר.

האם נוח לך שנתקשר או שאתה מעדיף לתאם פגישה?

בברכה,
צוות המכירות`
  },
  {
    id: "special_offer",
    name: "הצעה מיוחדת",
    description: "הודעה עם דגש על מבצעים וייתרונות",
    generateMessage: (leadName: string, leadSource?: string) => `שלום ${leadName}! 🎉

יש לנו חדשות נהדרות בשבילך!

כרגע יש לנו מבצע מיוחד על מגוון רכבים איכותיים שחושבים שיכולים לעניין אותך מאוד.

🔹 מחירים מיוחדים לתקופה מוגבלת
🔹 אחריות מורחבת
🔹 אפשרות למימון נוח
🔹 נסיעת מבחן ללא התחייבות

האם תרצה לשמוע עוד פרטים או לתאם ביקור במכירות?

בברכה,
צוות המכירות`
  },
  {
    id: "follow_up",
    name: "מעקב אחר פנייה",
    description: "הודעה לטיפול בפנייה קיימת",
    generateMessage: (leadName: string, leadSource?: string) => `שלום ${leadName},

אני חוזר אליך בנושא ${leadSource ? `הפנייה שלך ב${leadSource}` : 'הפנייה שלך אלינו'}.

רציתי לוודא שקיבלת את כל המידע שחיפשת ולראות אם יש עוד שאלות או דברים שאוכל לעזור לך איתם.

האם יש רכב ספציפי שמעניין אותך או שתרצה לשמוע על האפשרויות הזמינות אצלנו?

אני כאן לכל שאלה! 😊

בברכה,
צוות המכירות`
  },
  {
    id: "custom",
    name: "הודעה מותאמת אישית",
    description: "תבנית ריקה לעריכה חופשית",
    generateMessage: (leadName: string, leadSource?: string) => `שלום ${leadName},

[ערוך כאן את ההודעה שלך]

בברכה,
צוות המכירות`
  }
];
