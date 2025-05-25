
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { UserPlus } from "lucide-react";

interface WhatsappLeadSelectorProps {
  onLeadSelect: (leadId: string, leadPhone: string, leadName: string) => void;
  onNewLead: () => void;
  selectedLeadId?: string;
}

export function WhatsappLeadSelector({ onLeadSelect, onNewLead, selectedLeadId }: WhatsappLeadSelectorProps) {
  const { leads } = useLeads();
  
  // Filter leads that have phone numbers
  const leadsWithPhone = leads.filter(lead => lead.phone && lead.phone.trim() !== '');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">בחר לקוח קיים</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNewLead}
          className="flex items-center gap-1 text-xs"
        >
          <UserPlus className="h-3 w-3" />
          לקוח חדש
        </Button>
      </div>
      
      <Select value={selectedLeadId} onValueChange={(leadId) => {
        const selectedLead = leadsWithPhone.find(lead => lead.id === leadId);
        if (selectedLead) {
          onLeadSelect(leadId, selectedLead.phone!, selectedLead.name);
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
              <SelectItem key={lead.id} value={lead.id}>
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{lead.name}</span>
                  <span className="text-xs text-gray-500 mr-2">{lead.phone}</span>
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
  );
}
