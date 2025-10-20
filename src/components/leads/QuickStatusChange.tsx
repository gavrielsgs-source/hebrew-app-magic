
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
  
  // בדיקה אם זה ליד מפייסבוק (לידים כאלה לא ניתן לעדכן)
  const isFacebookLead = lead.source === 'Facebook' && lead.id?.includes('-');

  const handleStatusChange = async (newStatus: string) => {
    console.log('🔄 Status change requested:', { leadId: lead.id, oldStatus: lead.status, newStatus, isFacebookLead });
    
    if (newStatus === lead.status) {
      console.log('⚠️ Status unchanged, skipping update');
      return;
    }
    
    if (isFacebookLead) {
      toast({
        title: "לא ניתן לעדכן",
        description: "לידים מפייסבוק אינם ניתנים לעדכון. צור ליד חדש לניהול מלא.",
        variant: "destructive"
      });
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
      disabled={isChanging || isFacebookLead}
    >
      <SelectTrigger className={`leads-status-badge border-0 p-0 h-auto cursor-pointer ${getStatusBadgeColor(lead.status)} inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isFacebookLead ? 'opacity-60 cursor-not-allowed' : ''}`}>
        <SelectValue>
          {getStatusText(lead.status)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white rounded-2xl shadow-2xl border-2 z-50" dir="rtl">
        <SelectItem value="new" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">חדש</SelectItem>
        <SelectItem value="in_treatment" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">בטיפול</SelectItem>
        <SelectItem value="waiting" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">ממתין</SelectItem>
        <SelectItem value="meeting_scheduled" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">נקבעה פגישה</SelectItem>
        <SelectItem value="handled" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">טופל</SelectItem>
        <SelectItem value="not_relevant" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">לא רלוונטי</SelectItem>
      </SelectContent>
    </Select>
  );
}
