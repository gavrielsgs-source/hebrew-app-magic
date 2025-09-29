
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
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onWhatsApp}
        className="leads-card-button bg-muted/20 border-muted/40 text-foreground hover:bg-success/20 hover:text-success hover:border-success/40 hover:scale-105 transition-all duration-300 rounded-full px-3 py-2"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <span>וואטסאפ</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSchedule}
        className="leads-card-button bg-muted/20 border-muted/40 text-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/40 hover:scale-105 transition-all duration-300 rounded-full px-3 py-2"
      >
        <Phone className="h-4 w-4 mr-2" />
        <span>פגישה</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="leads-card-button bg-muted/20 border-muted/40 text-foreground hover:bg-warning/20 hover:text-warning hover:border-warning/40 hover:scale-105 transition-all duration-300 rounded-full px-3 py-2"
      >
        <Edit className="h-4 w-4 mr-2" />
        <span>עריכה</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="leads-card-button bg-muted/20 border-muted/40 text-foreground hover:bg-destructive/20 hover:text-destructive hover:border-destructive/40 hover:scale-105 transition-all duration-300 rounded-full px-3 py-2"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        <span>מחק</span>
      </Button>
    </div>
  );
}
