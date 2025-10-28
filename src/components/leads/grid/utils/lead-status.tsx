
import { Badge } from "@/components/ui/badge";

export const getStatusBadgeColor = (status: string | null) => {
  switch (status) {
    case "new": return "bg-blue-500 hover:bg-blue-600 text-white";
    case "in_treatment": return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "waiting": return "bg-purple-500 hover:bg-purple-600 text-white";
    case "meeting_scheduled": return "bg-green-500 hover:bg-green-600 text-white";
    case "follow_up": return "bg-orange-500 hover:bg-orange-600 text-white";
    case "handled": return "bg-green-600 hover:bg-green-700 text-white";
    case "not_relevant": return "bg-red-500 hover:bg-red-600 text-white";
    default: return "bg-blue-500 hover:bg-blue-600 text-white";
  }
};

export const getStatusText = (status: string | null) => {
  switch (status) {
    case "new": return "חדש";
    case "in_treatment": return "בטיפול";
    case "waiting": return "ממתין";
    case "meeting_scheduled": return "נקבעה פגישה";
    case "follow_up": return "לעקוב";
    case "handled": return "טופל";
    case "not_relevant": return "לא רלוונטי";
    default: return "לא ידוע";
  }
};

export function LeadStatusBadge({ status }: { status: string | null }) {
  return (
    <Badge className={`${getStatusBadgeColor(status)} px-4 py-2 text-sm font-semibold rounded-2xl`}>
      {getStatusText(status)}
    </Badge>
  );
}
