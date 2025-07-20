
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
    id: "client_intro",
    name: "הכרות עם לקוח פוטנציאלי",
    description: "הודעת היכרות ראשונית עם לקוח שפנה אלינו",
    type: 'lead' as const,
    generateMessage: (leadName: string, leadSource?: string) => `היי ${leadName}! 👋

קיבלנו את הפנייה שלך${leadSource ? ` דרך ${leadSource}` : ''} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות`
  }
];

// Unified template type for both car and lead templates
export type UnifiedTemplate = WhatsappTemplate | WhatsappLeadTemplate;
