
import { Badge } from "@/components/ui/badge";

interface CarStatusBadgeProps {
  status: string | null;
}

export function getStatusBadgeColor(status: string | null) {
  switch (status) {
    case "available":
      return "bg-green-500 hover:bg-green-600";
    case "reserved":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "sold":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

export function getStatusText(status: string | null) {
  switch (status) {
    case "available":
      return "זמין";
    case "reserved":
      return "שמור";
    case "sold":
      return "נמכר";
    default:
      return "לא ידוע";
  }
}

export function CarStatusBadge({ status }: CarStatusBadgeProps) {
  return (
    <Badge className={getStatusBadgeColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
}
