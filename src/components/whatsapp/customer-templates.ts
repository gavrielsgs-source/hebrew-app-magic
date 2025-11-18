
export interface WhatsappCustomerTemplate {
  id: string;
  name: string;
  description: string;
  type: 'customer';
  generateMessage: (customerName: string, customerSource?: string, cta?: string) => string;
  templateContent?: string;
}

export const whatsappCustomerTemplates: WhatsappCustomerTemplate[] = [
  {
    id: "customer_welcome",
    name: "ברוכים הבאים - לקוח חדש",
    description: "הודעת ברכה ללקוח שנוסף למערכת",
    type: 'customer' as const,
    templateContent: `שלום {{customerName}}! 👋

קיבלנו את פנייתך 🙏 

צוות המכירות שלנו יחזור אליך בקרוב 😊`,
    generateMessage: (customerName: string, customerSource?: string, cta?: string) => {
      return `שלום ${customerName}! 👋

קיבלנו את פנייתך 🙏 

צוות המכירות שלנו יחזור אליך בקרוב 😊`;
    }
  },
  {
    id: "customer_follow_up_car",
    name: "מעקב - פרטי רכב",
    description: "הודעת מעקב לאחר שליחת פרטי רכב ללקוח",
    type: 'customer' as const,
    templateContent: `היי {{customerName}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב {{carDetails}} 🚗  
אם תרצה {{CTA}} - נשמח לעזור!

בברכה,
צוות המכירות`,
    generateMessage: (customerName: string, carDetails?: string, cta = 'לתאם שיחה קצרה או להגיע לצפייה') => {
      const content = `היי {{customerName}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב {{carDetails}} 🚗  
אם תרצה {{CTA}} - נשמח לעזור!

בברכה,
צוות המכירות`;
      
      return content
        .replace(/\{\{customerName\}\}/g, customerName || '')
        .replace(/\{\{carDetails\}\}/g, carDetails || '')
        .replace(/\{\{CTA\}\}/g, cta || 'לתאם שיחה קצרה או להגיע לצפייה');
    }
  }
];
