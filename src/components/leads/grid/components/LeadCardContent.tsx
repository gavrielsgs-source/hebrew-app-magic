
import { CardContent } from "@/components/ui/card";
import { Phone, MessageSquare, User } from "lucide-react";

interface LeadCardContentProps {
  lead: any;
}

export function LeadCardContent({ lead }: LeadCardContentProps) {
  return (
    <CardContent className="p-4">
      <div className="space-y-3">
        {lead.phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
            <span dir="ltr">{lead.phone}</span>
          </div>
        )}
        
        {lead.email && (
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 ml-2 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>
        )}
        
        {lead.source && (
          <div className="flex items-center">
            <span className="text-sm font-semibold ml-2">מקור:</span>
            <span>{lead.source}</span>
          </div>
        )}
        
        {lead.assigned_to && (
          <div className="flex items-center">
            <User className="h-4 w-4 ml-2 text-muted-foreground" />
            <span>מטפל: {lead.profiles?.full_name || "לא ידוע"}</span>
          </div>
        )}
        
        {lead.cars && (
          <div className="flex items-center">
            <span className="text-sm font-semibold ml-2">רכב:</span>
            <span>{`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}</span>
          </div>
        )}
        
        {lead.notes && (
          <div className="pt-2 border-t border-slate-100 mt-2">
            <p className="text-sm font-medium text-slate-600 mb-1">הערות:</p>
            <p className="text-sm whitespace-pre-line text-slate-700">{lead.notes}</p>
          </div>
        )}
      </div>
    </CardContent>
  );
}
