import { AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NonDefaultTemplateWarningProps {
  phoneNumber: string;
  message: string;
  className?: string;
}

export function NonDefaultTemplateWarning({ 
  phoneNumber, 
  message,
  className = ""
}: NonDefaultTemplateWarningProps) {
  const formatPhoneForWhatsAppLink = (phone: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('972')) return cleanPhone;
    if (cleanPhone.startsWith('0')) return '972' + cleanPhone.substring(1);
    return '972' + cleanPhone;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success("ההודעה הועתקה ללוח");
  };

  const handleOpenWhatsAppLink = () => {
    const formattedPhone = formatPhoneForWhatsAppLink(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Alert className={`border-amber-500/50 bg-amber-500/10 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-right text-sm space-y-3" dir="rtl">
        <p className="font-medium text-amber-700 dark:text-amber-400">
          ⚠️ שים לב: תבנית זו אינה מאושרת על ידי WhatsApp Business
        </p>
        <p className="text-muted-foreground">
          לא ניתן לשלוח הודעה זו אלא אם הלקוח ענה לבוט ב-24 השעות האחרונות.
          אם לא - מומלץ לשלוח את ההודעה באחת מהדרכים הבאות:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMessage}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
            העתק הודעה
          </Button>
          {phoneNumber && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenWhatsAppLink}
              className="gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              שלח דרך WhatsApp Web
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
