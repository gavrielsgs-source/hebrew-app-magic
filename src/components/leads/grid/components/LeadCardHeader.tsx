
import { QuickStatusChange } from "../../QuickStatusChange";
import { LeadScoreIndicator } from "./LeadScoreIndicator";
import { Calendar, Clock, Zap } from "lucide-react";
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
    <div className="relative bg-gradient-to-l from-slate-50 via-blue-50 to-white p-6 border-b border-blue-100" dir="rtl">
      {/* אינדיקטור תזכורות פעילות */}
      {hasActiveReminders && (
        <div className="absolute top-4 left-4">
          <div className="relative">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-orange-300 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        {/* צד ימין - שם הליד */}
        <div className="text-right flex-1 ml-4">
          <h3 className="text-2xl font-bold text-[#2F3C7E] mb-6 leading-tight">
            {lead.name}
          </h3>
        </div>
        
        {/* צד שמאל ויזואלי - הקוביות אחת מעל השנייה ותאריך */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <LeadScoreIndicator leadId={lead.id} />
            <QuickStatusChange lead={lead} />
          </div>
          <div className="flex items-center gap-2">
            {lead.source ? (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-[#2F3C7E] border-blue-200 font-medium px-3 py-1">
                <Zap className="h-3 w-3 ml-1" />
                {lead.source}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500 border-gray-300 font-medium">
                ידני
              </Badge>
            )}
          </div>
          {/* תאריך יצירה */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{timeAgo(lead.created_at)}</span>
            <Calendar className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
