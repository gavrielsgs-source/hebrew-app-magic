
import { Badge } from "@/components/ui/badge";
import { CardHeader } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LeadReminders } from "../LeadReminders";
import { getStatusBadgeColor, getStatusText } from "../utils/lead-status";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface LeadCardHeaderProps {
  lead: any;
  hasActiveReminders: boolean;
}

export function LeadCardHeader({ lead, hasActiveReminders }: LeadCardHeaderProps) {
  const formattedDate = formatDistanceToNow(new Date(lead.created_at), { 
    addSuffix: true,
    locale: he
  });

  return (
    <CardHeader className="bg-slate-50 p-4 flex flex-row justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg">{lead.name}</h3>
        <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
          <Clock className="h-3.5 w-3.5 ml-1" />
          {formattedDate}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {hasActiveReminders && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <AlertCircle className="h-5 w-5 text-yellow-500 cursor-pointer" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <LeadReminders lead={lead} />
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>יש תזכורות מתוזמנות</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Badge className={`${getStatusBadgeColor(lead.status)}`}>
          {getStatusText(lead.status)}
        </Badge>
      </div>
    </CardHeader>
  );
}
