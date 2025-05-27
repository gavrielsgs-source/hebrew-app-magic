
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Send, Calendar, Edit } from "lucide-react";
import { EditLeadForm } from "../EditLeadForm";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
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
    <div className="flex space-x-1 space-x-reverse justify-end">
      <Button 
        variant="ghost" 
        size="icon"
        className="h-8 w-8 hover:bg-green-100 hover:text-green-600 transition-colors"
        onClick={() => {
          if (lead.phone) {
            window.open(`tel:${lead.phone}`, '_blank');
          }
        }}
        disabled={!lead.phone}
      >
        <Phone className="h-4 w-4" />
      </Button>
      
      <SwipeDialog open={isWhatsappOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
        setIsWhatsappOpen(open);
        if (open) setSelectedLeadId(lead.id as string);
      }}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            disabled={!lead.cars}
            onClick={() => setSelectedLeadId(lead.id as string)}
          >
            <Send className="h-4 w-4" />
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
            />
          )}
        </DialogContent>
      </SwipeDialog>
      
      <SwipeDialog open={isScheduleOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
        setIsScheduleOpen(open);
        if (open) setSelectedLeadId(lead.id as string);
      }}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 transition-colors"
            onClick={() => setSelectedLeadId(lead.id as string)}
          >
            <Calendar className="h-4 w-4" />
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
            className="h-8 w-8 hover:bg-orange-100 hover:text-orange-600 transition-colors"
            onClick={() => setSelectedLeadId(lead.id as string)}
          >
            <Edit className="h-4 w-4" />
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
