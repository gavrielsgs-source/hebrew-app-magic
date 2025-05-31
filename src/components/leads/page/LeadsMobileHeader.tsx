
import { Plus, MessageSquare, Calendar } from "lucide-react";

interface LeadsMobileHeaderProps {
  onAddLead: () => void;
  onWhatsApp: () => void;
  onScheduleMeeting: () => void;
  leadsCount: number;
}

export function LeadsMobileHeader({ 
  onAddLead, 
  onWhatsApp, 
  onScheduleMeeting, 
  leadsCount 
}: LeadsMobileHeaderProps) {

  const handleAddLead = () => {
    console.log('LeadsMobileHeader - Add lead clicked');
    onAddLead();
  };

  const handleWhatsApp = () => {
    console.log('LeadsMobileHeader - WhatsApp clicked');
    window.open('https://web.whatsapp.com', '_blank');
    onWhatsApp();
  };

  const handleScheduleMeeting = () => {
    console.log('LeadsMobileHeader - Schedule meeting clicked');
    alert('פונקציונליות קביעת פגישה תתווסף בקרוב');
    onScheduleMeeting();
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Enhanced header with brand gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white mb-1 text-right">
              ניהול לידים
            </h1>
            <p className="text-sm text-white/90 text-right">
              {leadsCount} לקוחות רשומים
            </p>
          </div>
          <button
            onClick={handleAddLead}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 active:scale-95 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleWhatsApp}
          className="flex-1 h-10 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100"
        >
          <MessageSquare className="h-5 w-5" />
          וואטסאפ
        </button>
        <button
          onClick={handleScheduleMeeting}
          className="flex-1 h-10 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Calendar className="h-5 w-5" />
          פגישה
        </button>
      </div>
    </div>
  );
}
