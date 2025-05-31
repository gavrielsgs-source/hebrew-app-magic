
import { useState } from "react";
import { Plus, MessageSquare, Calendar } from "lucide-react";
import { MobileButton } from "@/components/mobile/MobileButton";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddLead = () => {
    setShowAddDialog(true);
    onAddLead();
  };

  const handleWhatsApp = () => {
    // פתיחת WhatsApp Web
    window.open('https://web.whatsapp.com', '_blank');
    onWhatsApp();
  };

  const handleScheduleMeeting = () => {
    // יכול להיות מחובר למערכת לוח שנה או פשוט להראות הודעה
    alert('פונקציונליות קביעת פגישה תתווסף בקרוב');
    onScheduleMeeting();
  };

  return (
    <>
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
          <MobileButton
            variant="outline"
            size="md"
            onClick={handleWhatsApp}
            icon={<MessageSquare className="h-5 w-5" />}
            className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            וואטסאפ
          </MobileButton>
          <MobileButton
            variant="outline"
            size="md"
            onClick={handleScheduleMeeting}
            icon={<Calendar className="h-5 w-5" />}
            className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            פגישה
          </MobileButton>
        </div>
      </div>

      {/* Add Lead Dialog */}
      <SwipeDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>הוסף לקוח חדש</DialogTitle>
          </DialogHeader>
          <AddLeadForm onSuccess={() => setShowAddDialog(false)} />
        </DialogContent>
      </SwipeDialog>
    </>
  );
}
