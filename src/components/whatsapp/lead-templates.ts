
import { WhatsappTemplate } from "./whatsapp-templates";

export interface WhatsappLeadTemplate {
  id: string;
  name: string;
  description: string;
  type: 'lead';
  generateMessage: (leadName: string, leadSource?: string) => string;
  templateContent?: string;
}

export const whatsappLeadTemplates: WhatsappLeadTemplate[] = [
  {
    id: "potential_customer",
    name: "הכרות עם לקוח פוטנציאלי",
    description: "הודעת היכרות ראשונית עם לקוח שפנה אלינו",
    type: 'lead' as const,
    templateContent: `היי {{leadName}}! 👋

קיבלנו את הפנייה שלך{{leadSource}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`,
    generateMessage: (leadName: string, leadSource?: string) => {
      const sourceText = leadSource ? ` דרך ${leadSource}` : '';
      return `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${sourceText} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`;
    }
  },
  {
    id: "lead_follow_up_car",
    name: "מעקב - פרטי רכב ללקוח",
    description: "הודעת מעקב לאחר שליחת פרטי רכב ללקוח פוטנציאלי",
    type: 'lead' as const,
    templateContent: `היי {{leadName}}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב{{carDetails}} 🚗  
אם תרצה לתאם שיחה קצרה או להגיע לצפייה — נשמח לעזור!

בברכה,
צוות המכירות`,
    generateMessage: (leadName: string, carDetails?: string) => {
      const carText = carDetails ? ` ${carDetails}` : '';
      return `היי ${leadName}! 👋  

רק רצינו לוודא שקיבלת את הפרטים על הרכב${carText} 🚗  
אם תרצה לתאם שיחה קצרה או להגיע לצפייה — נשמח לעזור!

בברכה,
צוות המכירות`;
    }
  }
];

// Unified template type for both car and lead templates
export type UnifiedTemplate = WhatsappTemplate | WhatsappLeadTemplate;
