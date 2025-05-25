
import { CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Car, MessageSquare } from "lucide-react";

interface LeadCardContentProps {
  lead: any;
}

export function LeadCardContent({ lead }: LeadCardContentProps) {
  return (
    <CardContent className="p-6 pt-0">
      <div className="space-y-4">
        {/* פרטי יצירת קשר */}
        <div className="grid grid-cols-1 gap-3">
          {lead.phone && (
            <div className="flex items-center justify-end bg-gray-50 p-3 rounded-lg">
              <div className="text-right ml-3">
                <div className="font-medium text-gray-900" dir="ltr">{lead.phone}</div>
                <div className="text-xs text-gray-500">טלפון</div>
              </div>
              <Phone className="h-5 w-5 text-[#2F3C7E]" />
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center justify-end bg-gray-50 p-3 rounded-lg">
              <div className="text-right ml-3">
                <div className="font-medium text-gray-900 truncate max-w-[200px]">{lead.email}</div>
                <div className="text-xs text-gray-500">אימייל</div>
              </div>
              <Mail className="h-5 w-5 text-[#2F3C7E]" />
            </div>
          )}
        </div>
        
        {/* מטפל ורכב */}
        <div className="space-y-3">
          {lead.assigned_to && (
            <div className="flex items-center justify-end">
              <div className="text-right ml-2">
                <span className="text-sm font-medium text-gray-700">
                  {lead.profiles?.full_name || "לא ידוע"}
                </span>
                <div className="text-xs text-gray-500">מטפל</div>
              </div>
              <User className="h-4 w-4 text-gray-500" />
            </div>
          )}
          
          {lead.cars && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-end">
                <div className="text-right ml-3">
                  <div className="font-semibold text-[#2F3C7E]">
                    {`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {lead.cars.price?.toLocaleString()} ₪
                  </div>
                </div>
                <Car className="h-5 w-5 text-[#2F3C7E]" />
              </div>
            </div>
          )}
        </div>
        
        {/* הערות */}
        {lead.notes && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-right flex-1">
                <div className="text-xs font-medium text-yellow-700 mb-1">הערות</div>
                <p className="text-sm text-yellow-800 whitespace-pre-line leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}
