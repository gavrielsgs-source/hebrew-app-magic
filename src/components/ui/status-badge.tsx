import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'זמין':
        return 'bg-status-available text-success-foreground hover:bg-status-available/80';
      case 'sold':
      case 'נמכר':
        return 'bg-status-sold text-destructive-foreground hover:bg-status-sold/80';
      case 'reserved':
      case 'שמור':
        return 'bg-status-reserved text-warning-foreground hover:bg-status-reserved/80';
      case 'pending':
      case 'בהמתנה':
        return 'bg-status-pending text-info-foreground hover:bg-status-pending/80';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <Badge 
      className={cn(
        "transition-colors",
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </Badge>
  );
}