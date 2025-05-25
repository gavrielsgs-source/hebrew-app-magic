
import { CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Car, MessageSquare } from "lucide-react";

interface LeadCardContentProps {
  lead: any;
}

export function LeadCardContent({ lead }: LeadCardContentProps) {
  return (
    <CardContent className="p-6 pt-0">
      <div className="space-y-4" dir="rtl">
        {/* פרטי יצירת קשר */}
        <div className="grid grid-cols-1 gap-3">
          {lead.phone && (
            <div className="flex items-center justify-end bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100 shadow-sm" dir="rtl">
              <div className="text-right flex-1">
                <div className="font-semibold text-gray-900" dir="ltr">{lead.phone}</div>
                <div className="text-xs text-gray-500 font-medium">טלפון</div>
              </div>
              <Phone className="h-5 w-5 text-[#2F3C7E] flex-shrink-0 mr-3" />
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center justify-end bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl border border-purple-100 shadow-sm" dir="rtl">
              <div className="text-right flex-1">
                <div className="font-semibold text-gray-900 truncate max-w-[200px]">{lead.email}</div>
                <div className="text-xs text-gray-500 font-medium">אימייל</div>
              </div>
              <Mail className="h-5 w-5 text-purple-600 flex-shrink-0 mr-3" />
            </div>
          )}
        </div>
        
        {/* מטפל */}
        {lead.assigned_to && (
          <div className="flex items-center justify-end bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-100" dir="rtl">
            <div className="text-right flex-1">
              <span className="text-sm font-semibold text-gray-700">
                {lead.profiles?.full_name || "לא ידוע"}
              </span>
              <div className="text-xs text-gray-500 font-medium">מטפל</div>
            </div>
            <User className="h-4 w-4 text-gray-500 flex-shrink-0 mr-3" />
          </div>
        )}
        
        {/* פרטי רכב */}
        {lead.cars && (
          <div className="bg-gradient-to-r from-blue-50 via-blue-25 to-white p-5 rounded-2xl border border-blue-200 shadow-sm" dir="rtl">
            <div className="flex items-start justify-end gap-4">
              <div className="text-right flex-1">
                <div className="font-bold text-[#2F3C7E] text-lg mb-1">
                  {`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}
                </div>
                {lead.cars.price && (
                  <div className="text-lg font-semibold text-gray-700">
                    {lead.cars.price.toLocaleString()} ₪
                  </div>
                )}
                <div className="text-xs text-gray-500 font-medium mt-1">פרטי רכב</div>
              </div>
              <Car className="h-6 w-6 text-[#2F3C7E] mt-1 flex-shrink-0 mr-3" />
            </div>
          </div>
        )}
        
        {/* הערות */}
        {lead.notes && (
          <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 p-5 rounded-2xl shadow-sm" dir="rtl">
            <div className="flex items-start justify-end gap-3">
              <div className="text-right flex-1">
                <div className="text-sm font-semibold text-amber-700 mb-2">הערות</div>
                <p className="text-sm text-amber-800 whitespace-pre-line leading-relaxed">
                  {lead.notes}
                </p>
              </div>
              <MessageSquare className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0 mr-3" />
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}
