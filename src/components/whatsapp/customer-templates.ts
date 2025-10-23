
export interface WhatsappCustomerTemplate {
  id: string;
  name: string;
  description: string;
  type: 'customer';
  generateMessage: (customerName: string, customerSource?: string) => string;
  templateContent?: string;
}

export const whatsappCustomerTemplates: WhatsappCustomerTemplate[] = [
  {
    id: "customer_welcome",
    name: "ברוכים הבאים - לקוח חדש",
    description: "הודעת ברכה ללקוח שנוסף למערכת",
    type: 'customer' as const,
    templateContent: `היי {{customerName}}! 👋

ברוך הבא למשפחת הלקוחות שלנו! 🎉

קיבלנו את הפרטים שלך{{customerSource}} ואנחנו מוכנים לעזור לך למצוא את הרכב המושלם!

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`,
    generateMessage: (customerName: string, customerSource?: string) => {
      const content = `היי {{customerName}}! 👋

ברוך הבא למשפחת הלקוחות שלנו! 🎉

קיבלנו את הפרטים שלך{{customerSource}} ואנחנו מוכנים לעזור לך למצוא את הרכב המושלם!

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`;
      
      return content
        .replace(/\{\{customerName\}\}/g, customerName || '')
        .replace(/\{\{customerSource\}\}/g, customerSource ? ` דרך ${customerSource}` : '');
    }
  },
  {
    id: "customer_follow_up_car",
    name: "מעקב - פרטי רכב",
    description: "הודעת מעקב לאחר שליחת פרטי רכב ללקוח",
    type: 'customer' as const,
    templateContent: `היי {{customerName}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב {{carDetails}} 🚗  
אם תרצה לתאם שיחה קצרה או להגיע לצפייה — נשמח לעזור!

בברכה,
צוות המכירות`,
    generateMessage: (customerName: string, carDetails?: string) => {
      const content = `היי {{customerName}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב {{carDetails}} 🚗  
אם תרצה לתאם שיחה קצרה או להגיע לצפייה — נשמח לעזור!

בברכה,
צוות המכירות`;
      
      return content
        .replace(/\{\{customerName\}\}/g, customerName || '')
        .replace(/\{\{carDetails\}\}/g, carDetails || '');
    }
  }
];
