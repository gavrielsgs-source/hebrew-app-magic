
import { Badge } from "@/components/ui/badge";

export const getStatusBadgeColor = (status: string | null) => {
  switch (status) {
    case "new": return "bg-slate-500 hover:bg-slate-600 text-white";
    case "in_treatment": return "bg-slate-600 hover:bg-slate-700 text-white";
    case "waiting": return "bg-slate-400 hover:bg-slate-500 text-white";
    case "meeting_scheduled": return "bg-primary hover:bg-primary/90 text-white";
    case "handled": return "bg-slate-700 hover:bg-slate-800 text-white";
    case "not_relevant": return "bg-slate-300 hover:bg-slate-400 text-slate-800";
    default: return "bg-slate-500 hover:bg-slate-600 text-white";
  }
};

export const getStatusText = (status: string | null) => {
  switch (status) {
    case "new": return "חדש";
    case "in_treatment": return "בטיפול";
    case "waiting": return "ממתין";
    case "meeting_scheduled": return "נקבעה פגישה";
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
