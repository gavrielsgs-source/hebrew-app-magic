
import { QuickStatusChange } from "../../QuickStatusChange";
import { LeadScoreIndicator } from "./LeadScoreIndicator";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isAfter } from "date-fns";

export interface LeadCardHeaderProps {
  lead: any;
  hasActiveReminders?: boolean;
}

export function LeadCardHeader({ lead, hasActiveReminders }: LeadCardHeaderProps) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const leadDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "היום";
    if (diffInDays === 1) return "אתמול";
    if (diffInDays < 7) return `לפני ${diffInDays} ימים`;
    return leadDate.toLocaleDateString('he-IL');
  };

  return (
    <div className="relative bg-gradient-to-l from-blue-50 to-white p-6 border-b border-blue-100">
      {/* אינדיקטור תזכורות פעילות */}
      {hasActiveReminders && (
        <div className="absolute top-4 left-4">
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-lg"></div>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="text-right flex-1">
          <h3 className="text-xl font-bold text-[#2F3C7E] mb-2 leading-tight">
            {lead.name}
          </h3>
          
          {/* תאריך יצירה */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span>{timeAgo(lead.created_at)}</span>
            <Calendar className="h-4 w-4" />
          </div>
          
          {/* מקור הליד */}
          {lead.source && (
            <Badge variant="outline" className="bg-white/80 text-[#2F3C7E] border-[#2F3C7E]/30">
              {lead.source}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <LeadScoreIndicator leadId={lead.id} />
          <QuickStatusChange lead={lead} />
        </div>
      </div>
    </div>
  );
}
