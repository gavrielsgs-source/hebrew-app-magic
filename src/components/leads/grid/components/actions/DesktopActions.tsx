
import { Button } from "@/components/ui/button";
import { Edit, MessageSquare, Phone, Trash2 } from "lucide-react";

interface DesktopActionsProps {
  onWhatsApp: () => void;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DesktopActions({
  onWhatsApp,
  onSchedule,
  onEdit,
  onDelete
}: DesktopActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onWhatsApp}
        className="leads-card-button group relative overflow-hidden bg-gradient-to-r from-success/10 to-success/5 border-success/30 text-success hover:text-success-foreground hover:bg-success hover:border-success hover:scale-105 transition-all duration-300 rounded-full px-4 py-2 font-semibold"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-success/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <MessageSquare className="h-4 w-4 mr-2 relative z-10" />
        <span className="relative z-10">וואטסאפ</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSchedule}
        className="leads-card-button group relative overflow-hidden bg-gradient-to-r from-info/10 to-info/5 border-info/30 text-info hover:text-info-foreground hover:bg-info hover:border-info hover:scale-105 transition-all duration-300 rounded-full px-4 py-2 font-semibold"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-info/20 to-info/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Phone className="h-4 w-4 mr-2 relative z-10" />
        <span className="relative z-10">פגישה</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="leads-card-button group relative overflow-hidden bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30 text-warning hover:text-warning-foreground hover:bg-warning hover:border-warning hover:scale-105 transition-all duration-300 rounded-full px-4 py-2 font-semibold"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-warning/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Edit className="h-4 w-4 mr-2 relative z-10" />
        <span className="relative z-10">עריכה</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="leads-card-button group relative overflow-hidden bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30 text-destructive hover:text-destructive-foreground hover:bg-destructive hover:border-destructive hover:scale-105 transition-all duration-300 rounded-full px-4 py-2 font-semibold"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Trash2 className="h-4 w-4 mr-2 relative z-10" />
        <span className="relative z-10">מחק</span>
      </Button>
    </div>
  );
}
