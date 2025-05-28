
import { LeadsPageHeader } from "./LeadsPageHeader";

interface LeadsMobileHeaderProps {
  isAddingLead: boolean;
  setIsAddingLead: (open: boolean) => void;
  canAddLead: boolean;
  onLeadAdded: () => void;
  setActiveTab: (tab: string) => void;
}

export function LeadsMobileHeader(props: LeadsMobileHeaderProps) {
  return (
    <div className="p-4">
      <LeadsPageHeader {...props} />
    </div>
  );
}
