
import { CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Car, MessageSquare } from "lucide-react";

interface LeadCardContentProps {
  lead: any;
}

export function LeadCardContent({ lead }: LeadCardContentProps) {
  const phoneValue = lead.phone || "-";
  const emailValue = lead.email || "-";
  
  console.log('Lead data in card:', { id: lead.id, notes: lead.notes, hasNotes: !!lead.notes });
  
  return (
    <CardContent className="p-0">
      <div className="space-y-5" dir="rtl">
        {/* הערות - מוצג קודם */}
        {lead.notes && (
          <div className="leads-notes bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 p-4 rounded-xl shadow-md" dir="rtl">
            <div className="flex items-start justify-end gap-3">
              <div className="text-right flex-1">
                <div className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  הערות
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line leading-relaxed font-medium">
                  {lead.notes}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* פרטי יצירת קשר */}
        <div className="grid grid-cols-1 gap-4">
          {lead.phone && (
            <div className="flex items-center justify-end bg-muted/30 p-4 rounded-xl border border-muted/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]" dir="rtl">
              <div className="text-right flex-1">
                <div className="font-bold text-foreground text-base" dir="ltr">{phoneValue}</div>
                <div className="text-xs text-muted-foreground font-medium">טלפון</div>
              </div>
              <div className="bg-muted/50 p-2 rounded-full mr-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center justify-end bg-muted/30 p-4 rounded-xl border border-muted/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]" dir="rtl">
              <div className="text-right flex-1">
                <div className="font-bold text-foreground text-base truncate max-w-[200px]">{emailValue}</div>
                <div className="text-xs text-muted-foreground font-medium">אימייל</div>
              </div>
              <div className="bg-muted/50 p-2 rounded-full mr-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          )}
        </div>
        
        {/* מטפל */}
        {lead.assigned_to && (
          <div className="flex items-center justify-end bg-muted/20 p-4 rounded-xl border border-muted/40 hover:shadow-md transition-all duration-300 hover:scale-[1.01]" dir="rtl">
            <div className="text-right flex-1">
              <span className="text-sm font-semibold text-foreground">
                {lead.profiles?.full_name || "לא ידוע"}
              </span>
              <div className="text-xs text-muted-foreground font-medium">מטפל</div>
            </div>
            <div className="bg-muted/40 p-2 rounded-full mr-3">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        )}
        
        {/* פרטי רכב */}
        {lead.cars && (
          <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]" dir="rtl">
            <div className="flex items-start justify-end gap-4">
              <div className="text-right flex-1">
                <div className="font-bold text-primary text-lg mb-1">
                  {`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}
                </div>
                {lead.cars.price && (
                  <div className="text-xl font-bold text-foreground mb-1">
                    {lead.cars.price.toLocaleString()} ₪
                  </div>
                )}
                <div className="text-xs text-muted-foreground font-medium">פרטי רכב</div>
              </div>
              <div className="bg-primary/20 p-2 rounded-full mr-3">
                <Car className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
            </div>
          </div>
        )}
        
        {/* הערות שהוזז למעלה - קוד זה יימחק */}
      </div>
    </CardContent>
  );
}
