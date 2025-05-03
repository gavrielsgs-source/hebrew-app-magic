
import { Badge } from "@/components/ui/badge";

export const getStatusBadgeColor = (status: string | null) => {
  switch (status) {
    case "new": return "bg-blue-500 hover:bg-blue-600";
    case "in_progress": return "bg-yellow-500 hover:bg-yellow-600";
    case "waiting": return "bg-purple-500 hover:bg-purple-600";
    case "closed": return "bg-green-500 hover:bg-green-600";
    default: return "bg-gray-500 hover:bg-gray-600";
  }
};

export const getStatusText = (status: string | null) => {
  switch (status) {
    case "new": return "חדש";
    case "in_progress": return "בטיפול";
    case "waiting": return "בהמתנה";
    case "closed": return "סגור";
    default: return "לא ידוע";
  }
};

export function LeadStatusBadge({ status }: { status: string | null }) {
  return (
    <Badge className={getStatusBadgeColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
}
