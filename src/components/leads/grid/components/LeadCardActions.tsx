
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Edit, Phone, MessageSquare, Calendar, Plus, MessageCircle } from "lucide-react";
import { EditLeadForm } from "../../EditLeadForm";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { LeadReminders } from "../LeadReminders";
import { ScheduleMeetingForm } from "../../ScheduleMeetingForm";

interface LeadCardActionsProps {
  lead: any;
  canManageLeads: boolean;
}

export function LeadCardActions({ lead, canManageLeads }: LeadCardActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handlePhoneCall = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_blank');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-l from-gray-50 to-white border-t border-gray-100" dir="rtl">
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Phone Call Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePhoneCall}
          disabled={!lead.phone}
          className="flex items-center gap-2 h-12 bg-white hover:bg-blue-50 border-blue-200 text-[#2F3C7E] hover:border-blue-300 font-semibold shadow-sm transition-all duration-200"
        >
          <Phone className="h-4 w-4" />
          התקשר
        </Button>

        {/* Schedule Meeting Button */}
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 h-12 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:border-green-300 font-semibold shadow-sm transition-all duration-200"
            >
              <Calendar className="h-4 w-4" />
              פגישה
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>קבע פגישה/תזכורת - {lead.name}</DialogTitle>
            </DialogHeader>
            <ScheduleMeetingForm 
              lead={lead} 
              onSuccess={() => setIsScheduleOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* WhatsApp Button - ללא רקע ירוק */}
        <Dialog open={isWhatsappOpen} onOpenChange={setIsWhatsappOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!lead.cars}
              className="flex items-center gap-2 h-12 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:border-green-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 font-semibold shadow-sm transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              וואטסאפ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
            </DialogHeader>
            {lead.cars && (
              <WhatsappTemplateSelector 
                car={lead.cars} 
                onClose={() => setIsWhatsappOpen(false)}
                initialPhoneNumber={lead.phone || ""}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Reminders Button */}
        <Sheet open={isRemindersOpen} onOpenChange={setIsRemindersOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 h-12 bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-300 font-semibold shadow-sm transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              תזכורות
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]" dir="rtl">
            <SheetHeader>
              <SheetTitle>תזכורות ללקוח - {lead.name}</SheetTitle>
            </SheetHeader>
            <LeadReminders lead={lead} canAddReminder={canManageLeads} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Button - Full Width */}
      {canManageLeads && (
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full h-12 flex items-center gap-2 hover:bg-blue-50 text-[#2F3C7E] font-semibold rounded-xl border border-blue-100 bg-white/50 transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
              ערוך פרטי לקוח
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]" dir="rtl">
            <SheetHeader>
              <SheetTitle>עריכת לקוח</SheetTitle>
            </SheetHeader>
            <EditLeadForm 
              lead={lead} 
              onSuccess={() => setIsEditOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
