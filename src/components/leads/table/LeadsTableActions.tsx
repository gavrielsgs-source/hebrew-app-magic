
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Send, Calendar, Edit } from "lucide-react";
import { EditLeadForm } from "../EditLeadForm";
import { WhatsappLeadTemplateSelector } from "@/components/whatsapp/WhatsappLeadTemplateSelector";
import { ScheduleMeetingForm } from "../ScheduleMeetingForm";

interface LeadsTableActionsProps {
  lead: any;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string) => void;
  isWhatsappOpen: boolean;
  setIsWhatsappOpen: (open: boolean) => void;
  isScheduleOpen: boolean;
  setIsScheduleOpen: (open: boolean) => void;
  isEditLeadOpen: boolean;
  setIsEditLeadOpen: (open: boolean) => void;
}

export function LeadsTableActions({
  lead,
  selectedLeadId,
  setSelectedLeadId,
  isWhatsappOpen,
  setIsWhatsappOpen,
  isScheduleOpen,
  setIsScheduleOpen,
  isEditLeadOpen,
  setIsEditLeadOpen
}: LeadsTableActionsProps) {
  const selectedLead = selectedLeadId === lead.id ? lead : null;

  return (
    <div className="flex space-x-2 space-x-reverse justify-end">
      <Button 
        variant="ghost" 
        size="icon"
        className="h-10 w-10 rounded-full hover:bg-success/10 hover:text-success hover:scale-110 transition-all duration-200 shadow-sm border border-transparent hover:border-success/20"
        onClick={() => {
          if (lead.phone) {
            window.open(`tel:${lead.phone}`, '_blank');
          }
        }}
        disabled={!lead.phone}
      >
        <Phone className="h-5 w-5" />
      </Button>
      
      {/* WhatsApp dialog hidden - will be re-enabled later */}
      {false && (
      <SwipeDialog open={isWhatsappOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
        setIsWhatsappOpen(open);
        if (open) setSelectedLeadId(lead.id as string);
      }}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-info/10 hover:text-info hover:scale-110 transition-all duration-200 shadow-sm border border-transparent hover:border-info/20"
            onClick={() => setSelectedLeadId(lead.id as string)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>שליחת הודעה בוואטסאפ</DialogTitle>
          </DialogHeader>
          {lead.phone && (
            <WhatsappLeadTemplateSelector
              leadName={lead.name as string}
              leadPhone={lead.phone as string}
              leadSource={lead.source as string}
              leadId={lead.id as string}
              onClose={() => setIsWhatsappOpen(false)}
            />
          )}
        </DialogContent>
      </SwipeDialog>
      )}
      
      <SwipeDialog open={isScheduleOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
        setIsScheduleOpen(open);
        if (open) setSelectedLeadId(lead.id as string);
      }}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-warning/10 hover:text-warning hover:scale-110 transition-all duration-200 shadow-sm border border-transparent hover:border-warning/20"
            onClick={() => setSelectedLeadId(lead.id as string)}
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>קבע פגישה/תזכורת - {lead.name as string}</DialogTitle>
          </DialogHeader>
          <ScheduleMeetingForm 
            lead={lead} 
            onSuccess={() => setIsScheduleOpen(false)}
          />
        </DialogContent>
      </SwipeDialog>
      
      <SwipeDialog open={isEditLeadOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
        setIsEditLeadOpen(open);
        if (open) setSelectedLeadId(lead.id as string);
      }}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-200 shadow-sm border border-transparent hover:border-destructive/20"
            onClick={() => setSelectedLeadId(lead.id as string)}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת לקוח</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <EditLeadForm 
              lead={selectedLead} 
              onSuccess={() => setIsEditLeadOpen(false)}
            />
          )}
        </DialogContent>
      </SwipeDialog>
    </div>
  );
}
