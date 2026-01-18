
import { Plus, MessageSquare } from "lucide-react";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";

interface TemplateHeaderProps {
  onNewTemplate: () => void;
  onResetDefaults?: () => void;
  canAddTemplate?: boolean;
}

export function TemplateHeader({ 
  onNewTemplate, 
  canAddTemplate = true 
}: TemplateHeaderProps) {
  return (
    <StandardPageHeader
      title="תבניות הודעה"
      subtitle="נהל והתאם אישית תבניות הודעות לשליחה ללקוחות"
      icon={MessageSquare}
      actionButton={{
        label: "תבנית חדשה",
        onClick: onNewTemplate,
        icon: Plus,
        className: !canAddTemplate ? "opacity-50 cursor-not-allowed" : undefined
      }}
    />
  );
}
