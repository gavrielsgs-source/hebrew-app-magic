
import { CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Car, MessageSquare } from "lucide-react";

interface LeadCardContentProps {
  lead: any;
}

export function LeadCardContent({ lead }: LeadCardContentProps) {
  return (
    <CardContent className="p-0">
      <div className="space-y-5" dir="rtl">
        {/* פרטי יצירת קשר */}
        <div className="grid grid-cols-1 gap-4">
          {lead.phone && (
            <div className="flex items-center justify-end bg-gradient-to-r from-success/10 via-success/5 to-background p-5 rounded-2xl border border-success/20 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]" dir="rtl">
              <div className="text-right flex-1">
                <div className="font-bold text-foreground text-lg" dir="ltr">{lead.phone}</div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">טלפון</div>
              </div>
              <div className="bg-success/20 p-2 rounded-full mr-4">
                <Phone className="h-5 w-5 text-success flex-shrink-0" />
              </div>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center justify-end bg-gradient-to-r from-info/10 via-info/5 to-background p-5 rounded-2xl border border-info/20 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]" dir="rtl">
              <div className="text-right flex-1">
                <div className="font-bold text-foreground text-lg truncate max-w-[200px]">{lead.email}</div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">אימייל</div>
              </div>
              <div className="bg-info/20 p-2 rounded-full mr-4">
                <Mail className="h-5 w-5 text-info flex-shrink-0" />
              </div>
            </div>
          )}
        </div>
        
        {/* מטפל */}
        {lead.assigned_to && (
          <div className="flex items-center justify-end bg-gradient-to-r from-muted/50 via-muted/30 to-background p-4 rounded-2xl border border-muted/40 hover:shadow-md transition-all duration-300 hover:scale-[1.01]" dir="rtl">
            <div className="text-right flex-1">
              <span className="text-sm font-bold text-foreground">
                {lead.profiles?.full_name || "לא ידוע"}
              </span>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">מטפל</div>
            </div>
            <div className="bg-muted/40 p-2 rounded-full mr-4">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        )}
        
        {/* פרטי רכב */}
        {lead.cars && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 rounded-3xl border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]" dir="rtl">
            <div className="flex items-start justify-end gap-5">
              <div className="text-right flex-1">
                <div className="font-bold text-primary text-xl mb-2">
                  {`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}
                </div>
                {lead.cars.price && (
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {lead.cars.price.toLocaleString()} ₪
                  </div>
                )}
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">פרטי רכב</div>
              </div>
              <div className="bg-primary/20 p-3 rounded-full mr-4">
                <Car className="h-7 w-7 text-primary flex-shrink-0" />
              </div>
            </div>
          </div>
        )}
        
        {/* הערות */}
        {lead.notes && (
          <div className="leads-notes bg-gradient-to-r from-warning/15 via-warning/10 to-background border border-warning/30 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]" dir="rtl">
            <div className="flex items-start justify-end gap-4">
              <div className="text-right flex-1">
                <div className="text-sm font-bold text-warning-foreground mb-3 uppercase tracking-wide">הערות</div>
                <p className="text-sm text-warning-foreground/90 whitespace-pre-line leading-relaxed font-medium">
                  {lead.notes}
                </p>
              </div>
              <div className="bg-warning/25 p-2 rounded-full mr-4">
                <MessageSquare className="h-5 w-5 text-warning flex-shrink-0" />
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}
