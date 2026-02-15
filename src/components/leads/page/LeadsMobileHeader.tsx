
import { Plus } from "lucide-react";
import { MobileButton } from "@/components/mobile/MobileButton";

interface LeadsMobileHeaderProps {
  onAddLead: () => void;
  onWhatsApp: () => void;
  leadsCount: number;
}

export function LeadsMobileHeader({
  onAddLead,
  onWhatsApp,
  leadsCount
}: LeadsMobileHeaderProps) {
  return (
    <div className="bg-card p-4 rounded-b-xl shadow-sm mx-4 mt-4 border border-border" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">ניהול לקוחות</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {leadsCount > 0 ? `${leadsCount} לקוחות פוטנציאליים` : 'אין לקוחות עדיין'}
          </p>
        </div>
      </div>
      
      {/* כפתור הוספה בלבד */}
      <MobileButton
        onClick={onAddLead}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold text-base shadow-md transition-all duration-300 w-full"
        icon={<Plus className="h-5 w-5" />}
      >
        הוסף לקוח חדש
      </MobileButton>
    </div>
  );
}
