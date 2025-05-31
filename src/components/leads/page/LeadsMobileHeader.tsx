
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

  // Enhanced mobile-first event handler with touch support
  const handleAddLeadMobile = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LeadsMobileHeader - Add lead clicked/touched');
    
    // Ensure immediate response on mobile
    requestAnimationFrame(() => {
      onAddLead();
    });
  };

  const handleWhatsApp = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LeadsMobileHeader - WhatsApp clicked/touched');
    try {
      window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
      onWhatsApp();
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback for mobile browsers
      window.location.href = 'https://web.whatsapp.com';
    }
  };

  const handleScheduleMeeting = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('LeadsMobileHeader - Schedule meeting clicked/touched');
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
          {/* Enhanced mobile-first button with touch support */}
          <button
            type="button"
            onClick={handleAddLeadMobile}
            onTouchStart={handleAddLeadMobile}
            className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-full p-3 transition-all duration-200 active:scale-95 flex items-center justify-center min-h-[48px] min-w-[48px]"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Action buttons with enhanced mobile support */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleWhatsApp}
          onTouchStart={handleWhatsApp}
          className="flex-1 h-12 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100 active:bg-green-200 min-h-[48px]"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <MessageSquare className="h-5 w-5" />
          וואטסאפ
        </button>
        <button
          type="button"
          onClick={handleScheduleMeeting}
          onTouchStart={handleScheduleMeeting}
          className="flex-1 h-12 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 active:bg-blue-200 min-h-[48px]"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <Calendar className="h-5 w-5" />
          פגישה
        </button>
      </div>
    </div>
  );
}
