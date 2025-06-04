
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
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        וואטסאפ
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSchedule}
      >
        <Phone className="h-4 w-4 mr-1" />
        פגישה
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4 mr-1" />
        עריכה
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        מחק
      </Button>
    </div>
  );
}
