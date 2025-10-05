
import { useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadsTableHeader } from "./leads/table/LeadsTableHeader";
import { LeadsTableContent } from "./leads/table/LeadsTableContent";

interface LeadsTableProps {
  searchTerm?: string;
  filteredLeads?: any[];
}

export function LeadsTable({ searchTerm = "", filteredLeads }: LeadsTableProps) {
  const { leads, isLoading } = useLeads();
  const isMobile = useIsMobile();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  
  // Use filtered leads if provided, otherwise use original logic with proper type checking
  console.log("leads - ")
  console.log(leads)
  const displayLeads = filteredLeads || (searchTerm
    ? leads.filter(lead => {
        const name = lead?.name as string || "";
        const phone = lead?.phone as string || "";
        const email = lead?.email as string || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               phone.includes(searchTerm) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : leads);
  
  return (
    <div dir="rtl" className={isMobile ? 'pb-24' : ''}>
      <LeadsTableHeader 
        isAddLeadOpen={isAddLeadOpen}
        setIsAddLeadOpen={setIsAddLeadOpen}
      />
      
      <LeadsTableContent
        displayLeads={displayLeads}
        isLoading={isLoading}
        selectedLeadId={selectedLeadId}
        setSelectedLeadId={setSelectedLeadId}
        isWhatsappOpen={isWhatsappOpen}
        setIsWhatsappOpen={setIsWhatsappOpen}
        isScheduleOpen={isScheduleOpen}
        setIsScheduleOpen={setIsScheduleOpen}
        isEditLeadOpen={isEditLeadOpen}
        setIsEditLeadOpen={setIsEditLeadOpen}
      />
    </div>
  );
}
