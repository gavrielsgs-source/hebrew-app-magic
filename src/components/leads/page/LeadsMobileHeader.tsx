
import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
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
    <div className="sticky top-0 z-10 bg-gradient-to-l from-[#2F3C7E] via-[#4A5A8C] to-[#2F3C7E] text-white p-6 rounded-b-3xl shadow-lg" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">ניהול לקוחות</h1>
          <p className="text-blue-100 text-lg mt-2">
            {leadsCount > 0 ? `${leadsCount} לקוחות פוטנציאליים` : 'אין לקוחות עדיין'}
          </p>
        </div>
      </div>
      
      {/* כפתורי פעולה */}
      <div className="grid grid-cols-2 gap-4">
        <MobileButton
          onClick={onAddLead}
          className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-16 rounded-2xl font-bold text-lg shadow-lg"
          icon={<Plus className="h-6 w-6" />}
        >
          הוסף לקוח חדש
        </MobileButton>
        
        <MobileButton
          onClick={onWhatsApp}
          className="bg-green-500/90 backdrop-blur-sm border-green-400/30 text-white hover:bg-green-600/90 h-16 rounded-2xl font-bold text-lg shadow-lg"
          icon={<MessageSquare className="h-6 w-6" />}
        >
          וואטסאפ ווב
        </MobileButton>
      </div>
    </div>
  );
}
