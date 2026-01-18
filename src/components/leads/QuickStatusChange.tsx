
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    console.log('🔄 Status change requested:', { leadId: lead.id, oldStatus: lead.status, newStatus });
    
    if (newStatus === lead.status) {
      console.log('⚠️ Status unchanged, skipping update');
      return;
    }
    
    setIsChanging(true);
    try {
      console.log('📤 Sending update request...');
      await updateLead.mutateAsync({ 
        id: lead.id, 
        data: { 
          status: newStatus,
          updated_at: new Date().toISOString()
        } 
      });
      
      console.log('✅ Status updated successfully');
      toast({
        title: "סטטוס עודכן",
        description: `הסטטוס שונה ל${getStatusText(newStatus)}`,
      });
      
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("❌ שגיאה בעדכון סטטוס:", error);
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
      <SelectTrigger 
        className={`leads-status-badge border-2 border-transparent p-0 h-auto cursor-pointer ${getStatusBadgeColor(lead.status)} inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2`}
        aria-label={`סטטוס: ${getStatusText(lead.status)}. לחץ לשינוי`}
      >
        <SelectValue>
          {getStatusText(lead.status)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent dir="rtl" align="end">
        <SelectItem value="new">חדש</SelectItem>
        <SelectItem value="in_treatment">בטיפול</SelectItem>
        <SelectItem value="waiting">ממתין</SelectItem>
        <SelectItem value="meeting_scheduled">נקבעה פגישה</SelectItem>
        <SelectItem value="follow_up">לעקוב</SelectItem>
        <SelectItem value="handled">טופל</SelectItem>
        <SelectItem value="not_relevant">לא רלוונטי</SelectItem>
      </SelectContent>
    </Select>
  );
}
