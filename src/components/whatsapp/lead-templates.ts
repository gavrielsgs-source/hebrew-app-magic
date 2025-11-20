
import { WhatsappTemplate } from "./whatsapp-templates";
import { WhatsappCustomerTemplate } from "./customer-templates";

export interface WhatsappLeadTemplate {
  id: string;
  name: string;
  description: string;
  type: 'lead';
  generateMessage: (leadName: string, leadSource?: string, cta?: string) => string;
  templateContent?: string;
  facebookTemplateName?: string;
}

export const whatsappLeadTemplates: WhatsappLeadTemplate[] = [
  {
    id: "potential_customer",
    name: "הכרות עם לקוח פוטנציאלי",
    description: "הודעת היכרות ראשונית עם לקוח שפנה אלינו",
    type: 'lead' as const,
    templateContent: `היי {{leadName}}! 👋

קיבלנו את הפנייה שלך{{leadSource}} וראינו שאתה מתעניין ברכב.

{{CTA}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`,
    generateMessage: (leadName: string, leadSource?: string, cta = 'מתי תהיה זמין לשיחת ייעוץ קצרה') => {
      const sourceText = leadSource ? ` דרך ${leadSource}` : '';
      return `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${sourceText} וראינו שאתה מתעניין ברכב.

${cta}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`;
    }
  },
  {
    id: "follow_up_car",
    name: "מעקב - פרטי רכב",
    description: "הודעת מעקב לאחר שליחת פרטי רכב",
    type: 'lead' as const,
    templateContent: `היי {{name}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב{{carDetails}} 🚗  
אם תרצה {{CTA}} - נשמח לעזור!

בברכה,
צוות המכירות`,
    generateMessage: (name: string, carDetails?: string, cta = 'לתאם שיחה קצרה או להגיע לצפייה') => {
      const carText = carDetails ? ` ${carDetails}` : '';
      return `היי ${name}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב${carText} 🚗  
אם תרצה ${cta} - נשמח לעזור!

בברכה,
צוות המכירות`;
    }
  }
];

// Unified template type for both car, lead, and customer templates
export type UnifiedTemplate = WhatsappTemplate | WhatsappLeadTemplate | WhatsappCustomerTemplate;
