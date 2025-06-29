
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
    <div className="bg-white p-4 rounded-b-xl shadow-sm mx-4 mt-4 border border-gray-100" dir="rtl">
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
          className="bg-[#2F3C7E] text-white hover:bg-[#1A2347] h-12 rounded-xl font-semibold text-base shadow-md transition-all duration-300 border border-gray-200"
          icon={<Plus className="h-5 w-5" />}
        >
          הוסף לקוח חדש
        </MobileButton>
        
        <MobileButton
          onClick={onWhatsApp}
          className="bg-white text-gray-700 hover:bg-gray-50 h-12 rounded-xl font-semibold text-base shadow-md transition-all duration-300 border-2 border-gray-300"
          icon={<MessageSquare className="h-5 w-5" />}
        >
          וואטסאפ
        </MobileButton>
      </div>
    </div>
  );
}
