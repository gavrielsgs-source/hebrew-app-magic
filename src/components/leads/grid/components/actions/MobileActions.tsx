
import { MobileButton } from "@/components/mobile/MobileButton";
import { Edit, MessageSquare, Phone, Trash2 } from "lucide-react";

interface MobileActionsProps {
  onWhatsApp: () => void;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MobileActions({
  onWhatsApp,
  onSchedule,
  onEdit,
  onDelete
}: MobileActionsProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Primary actions row */}
      <div className="flex gap-3">
        <MobileButton
          variant="outline"
          size="sm"
          onClick={onWhatsApp}
          icon={<MessageSquare className="h-5 w-5" />}
          className="flex-1 h-14 text-lg rounded-2xl bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          וואטסאפ
        </MobileButton>
        <MobileButton
          variant="outline"
          size="sm"
          onClick={onSchedule}
          icon={<Phone className="h-5 w-5" />}
          className="flex-1 h-14 text-lg rounded-2xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          פגישה
        </MobileButton>
      </div>

      {/* Secondary actions row */}
      <div className="flex gap-3">
        <MobileButton
          variant="outline"
          size="sm"
          onClick={onEdit}
          icon={<Edit className="h-5 w-5" />}
          className="flex-1 h-12 rounded-2xl"
        >
          עריכה
        </MobileButton>
        <MobileButton
          variant="outline"
          size="sm"
          onClick={onDelete}
          icon={<Trash2 className="h-5 w-5" />}
          className="flex-1 h-12 rounded-2xl text-red-600 border-red-200 hover:bg-red-50"
        >
          מחק
        </MobileButton>
      </div>
    </div>
  );
}
