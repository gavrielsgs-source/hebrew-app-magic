
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { getStatusBadgeColor, getStatusText } from "./grid/utils/lead-status";

interface QuickStatusChangeProps {
  lead: any;
  onStatusChange?: () => void;
}

export function QuickStatusChange({ lead, onStatusChange }: QuickStatusChangeProps) {
  const [isChanging, setIsChanging] = useState(false);
  const updateLead = useUpdateLead();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return;
    
    setIsChanging(true);
    try {
      await updateLead.mutateAsync({ 
        id: lead.id, 
        data: { 
          status: newStatus,
          updated_at: new Date().toISOString()
        } 
      });
      
      toast({
        title: "סטטוס עודכן",
        description: `הסטטוס שונה ל${getStatusText(newStatus)}`,
      });
      
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("שגיאה בעדכון סטטוס:", error);
      toast({
        title: "שגיאה בעדכון סטטוס",
        description: "נסה שנית",
        variant: "destructive"
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Select 
      value={lead.status} 
      onValueChange={handleStatusChange}
      disabled={isChanging}
    >
      <SelectTrigger asChild>
        <Badge className={`cursor-pointer ${getStatusBadgeColor(lead.status)}`}>
          {getStatusText(lead.status)}
        </Badge>
      </SelectTrigger>
      <SelectContent dir="rtl">
        <SelectItem value="new">חדש</SelectItem>
        <SelectItem value="in_progress">בטיפול</SelectItem>
        <SelectItem value="waiting">בהמתנה</SelectItem>
        <SelectItem value="closed">סגור</SelectItem>
      </SelectContent>
    </Select>
  );
}
