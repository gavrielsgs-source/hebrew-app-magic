
import { QuickStatusChange } from "../../QuickStatusChange";
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
    <div className="relative bg-gradient-to-br from-slate-50 to-white p-8 border-b border-slate-200 shadow-sm" dir="rtl">
      {/* אינדיקטור תזכורות פעילות */}
      {hasActiveReminders && (
        <div className="absolute top-6 left-6">
          <div className="relative">
            <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-5 h-5 bg-orange-300 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        {/* צד ימין - שם הליד וסטטוס */}
        <div className="text-right flex-1 ml-6">
          <h3 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
            {lead.name}
          </h3>
          <div className="inline-block">
            <QuickStatusChange lead={lead} />
          </div>
        </div>
        
        {/* צד שמאל ויזואלי - מקור ותאריך */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            {lead.source ? (
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-4 py-2 text-base rounded-2xl">
                <Zap className="h-4 w-4 ml-1" />
                {lead.source}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-600 border-slate-300 font-medium px-4 py-2 text-base rounded-2xl">
                ידני
              </Badge>
            )}
          </div>
          {/* תאריך יצירה */}
          <div className="flex items-center gap-3 text-base text-slate-600">
            <span className="font-medium">{timeAgo(lead.created_at)}</span>
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
