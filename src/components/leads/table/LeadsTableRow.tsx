
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QuickStatusChange } from "../QuickStatusChange";
import { LeadsTableActions } from "./LeadsTableActions";

interface LeadsTableRowProps {
  lead: any;
  index: number;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string) => void;
  isWhatsappOpen: boolean;
  setIsWhatsappOpen: (open: boolean) => void;
  isScheduleOpen: boolean;
  setIsScheduleOpen: (open: boolean) => void;
  isEditLeadOpen: boolean;
  setIsEditLeadOpen: (open: boolean) => void;
}

export function LeadsTableRow({
  lead,
  index,
  selectedLeadId,
  setSelectedLeadId,
  isWhatsappOpen,
  setIsWhatsappOpen,
  isScheduleOpen,
  setIsScheduleOpen,
  isEditLeadOpen,
  setIsEditLeadOpen
}: LeadsTableRowProps) {
  const name_keys = ["full_name", "first_name"]
  const phone_keys = ["phone", "phone_number"];
   const leadFields = lead.lead_data.field_data;
  const nameField = leadFields.find((f) => nameKeys.includes(f.name));
  const phoneField = leadFields.find((f) => phoneKeys.includes(f.name));
  const emailField = leadFields.find((f) => name = "email");
  
  
  return (
    <TableRow 
      key={lead.id} 
      className={`leads-table-row hover:bg-primary/5 hover:shadow-md hover:scale-[1.01] transition-all duration-300 border-b border-muted/30 ${
        index % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'
      }`}
    >
      <TableCell className="font-medium text-right py-5 px-8">
        <div className="font-bold text-primary text-lg">{nameField.values.join(",")}</div>
      </TableCell>
      <TableCell className="text-right py-5 px-8">
        <div className="text-foreground/80 font-medium">{(phoneField ? phoneField.values.join(",")) : "-"}</div>
      </TableCell>
      <TableCell className="text-right py-5 px-8">
        <div className="text-foreground/80 truncate max-w-[200px] font-medium">{emailField.values.join(",") || '-'}</div>
      </TableCell>
      <TableCell className="text-right py-5 px-8">
        <Badge 
          variant="secondary" 
          className={`${lead.source ? 
            'bg-gradient-to-r from-accent/20 to-primary/20 text-primary border-primary/30 shadow-sm' : 
            'bg-muted/50 text-muted-foreground border-muted/50'
          } font-semibold px-3 py-1 rounded-full text-xs`}
        >
          {(lead.source as string) || "ידני"}
        </Badge>
      </TableCell>
      <TableCell className="text-right py-5 px-8">
        <div className="text-sm text-muted-foreground font-medium">
          {new Date(lead.created_at as string).toLocaleDateString('he-IL')}
        </div>
      </TableCell>
      <TableCell className="text-right py-5 px-8">
        <QuickStatusChange lead={lead} />
      </TableCell>
      <TableCell className="py-5 px-8">
        <LeadsTableActions
          lead={lead}
          selectedLeadId={selectedLeadId}
          setSelectedLeadId={setSelectedLeadId}
          isWhatsappOpen={isWhatsappOpen}
          setIsWhatsappOpen={setIsWhatsappOpen}
          isScheduleOpen={isScheduleOpen}
          setIsScheduleOpen={setIsScheduleOpen}
          isEditLeadOpen={isEditLeadOpen}
          setIsEditLeadOpen={setIsEditLeadOpen}
        />
      </TableCell>
    </TableRow>
  );
}
