
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRoles } from "@/hooks/use-roles";
import { isAfter } from "date-fns";
import { LeadCardHeader } from "./components/LeadCardHeader";
import { LeadCardContent } from "./components/LeadCardContent";
import { LeadCardActions } from "./components/LeadCardActions";

export function LeadCard({ lead }: { lead: any }) {
  const { canManageLeads } = useRoles();
  const [hasActiveReminders, setHasActiveReminders] = useState(false);

  useEffect(() => {
    if (lead.follow_up_notes && Array.isArray(lead.follow_up_notes) && lead.follow_up_notes.length > 0) {
      const activeReminders = lead.follow_up_notes.filter((reminder: any) => 
        !reminder.completed && 
        isAfter(new Date(reminder.date), new Date())
      );
      setHasActiveReminders(activeReminders.length > 0);
    }
  }, [lead.follow_up_notes]);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-md transition-all hover:shadow-lg">
      <LeadCardHeader lead={lead} hasActiveReminders={hasActiveReminders} />
      <LeadCardContent lead={lead} />
      <LeadCardActions lead={lead} canManageLeads={canManageLeads()} />
    </Card>
  );
}
