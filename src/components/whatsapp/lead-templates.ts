
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
    templateContent: `היי {{leadName}},

קיבלתי את הפנייה שלך דרך פייסבוק וראיתי שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה?

יש שאלות לפני שאוכל לתת עליהם מענה?

אשמח לעזור לך למצוא בדיוק את מה שמתאים לך!

בברכה,
גבריאל כחלון, מנהל מכירות סופר ג'יפ - סניף באר שבע`,
    generateMessage: (leadName: string, leadSource?: string) => `היי ${leadName},

קיבלתי את הפנייה שלך דרך פייסבוק וראיתי שאתה מתעניין ברכב.

מתי תהיה זמין לשיחת ייעוץ קצרה?

יש שאלות לפני שאוכל לתת עליהם מענה?

אשמח לעזור לך למצוא בדיוק את מה שמתאים לך!

בברכה,
גבריאל כחלון, מנהל מכירות סופר ג'יפ - סניף באר שבע`
  }
];

// Unified template type for both car and lead templates
export type UnifiedTemplate = WhatsappTemplate | WhatsappLeadTemplate;
