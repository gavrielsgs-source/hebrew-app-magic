
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
    <div className="bg-transparent p-4 rounded-b-xl" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ניהול לקוחות</h1>
          <p className="text-gray-600 text-sm mt-1">
            {leadsCount > 0 ? `${leadsCount} לקוחות פוטנציאליים` : 'אין לקוחות עדיין'}
          </p>
        </div>
      </div>
      
      {/* כפתורי פעולה */}
      <div className="grid grid-cols-2 gap-3">
        <MobileButton
          onClick={onAddLead}
          className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] text-white hover:from-[#1A2347] hover:to-[#45A049] h-12 rounded-xl font-semibold text-base shadow-md transition-all duration-300"
          icon={<Plus className="h-5 w-5" />}
        >
          הוסף לקוח חדש
        </MobileButton>
        
        <MobileButton
          onClick={onWhatsApp}
          className="bg-green-500/90 text-white hover:bg-green-600/90 h-12 rounded-xl font-semibold text-base shadow-md transition-all duration-300"
          icon={<MessageSquare className="h-5 w-5" />}
        >
          וואטסאפ
        </MobileButton>
      </div>
    </div>
  );
}
