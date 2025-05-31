
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { UserPlus } from "lucide-react";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileAddLeadForm } from "@/components/leads/MobileAddLeadForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface WhatsappLeadSelectorProps {
  onLeadSelect: (leadId: string, leadPhone: string, leadName: string) => void;
  onNewLead: () => void;
  selectedLeadId?: string;
}

export function WhatsappLeadSelector({ onLeadSelect, onNewLead, selectedLeadId }: WhatsappLeadSelectorProps) {
  const { leads } = useLeads();
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter leads that have phone numbers with proper type checking
  const leadsWithPhone = leads.filter(lead => {
    const phone = lead.phone as string;
    return phone && phone.trim() !== '';
  });

  const handleNewLeadClick = () => {
    setIsAddLeadOpen(true);
  };

  const handleNewLeadSuccess = () => {
    setIsAddLeadOpen(false);
    // Switch to manual tab when a new lead is added
    onNewLead();
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">בחר לקוח קיים</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNewLeadClick}
            className="flex items-center gap-1 text-xs"
          >
            <UserPlus className="h-3 w-3" />
            לקוח חדש
          </Button>
        </div>
        
        <Select value={selectedLeadId} onValueChange={(leadId) => {
          const selectedLead = leadsWithPhone.find(lead => (lead.id as string) === leadId);
          if (selectedLead) {
            onLeadSelect(leadId, selectedLead.phone as string, selectedLead.name as string);
          }
        }}>
          <SelectTrigger className="w-full" dir="rtl">
            <SelectValue placeholder="בחר לקוח מהרשימה..." />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {leadsWithPhone.length === 0 ? (
              <SelectItem value="no-leads" disabled>
                אין לקוחות עם מספר טלפון
              </SelectItem>
            ) : (
              leadsWithPhone.map((lead) => (
                <SelectItem key={lead.id as string} value={lead.id as string}>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium">{lead.name as string}</span>
                    <span className="text-xs text-gray-500 mr-2">{lead.phone as string}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        {leadsWithPhone.length === 0 && (
          <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            לא נמצאו לקוחות עם מספר טלפון במערכת
          </p>
        )}
      </div>

      <SwipeDialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">הוסף לקוח חדש</DialogTitle>
          </DialogHeader>
          {isMobile ? (
            <MobileAddLeadForm onSuccess={handleNewLeadSuccess} />
          ) : (
            <MobileAddLeadForm onSuccess={handleNewLeadSuccess} />
          )}
        </DialogContent>
      </SwipeDialog>
    </>
  );
}
