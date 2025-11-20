
export interface WhatsappCustomerTemplate {
  id: string;
  name: string;
  description: string;
  type: 'customer';
  generateMessage: (customerName: string, customerSource?: string, cta?: string) => string;
  templateContent?: string;
  facebookTemplateName?: string;
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
];
