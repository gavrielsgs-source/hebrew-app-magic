
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
  return (
    <TableRow 
      key={lead.id} 
      className={`leads-table-row hover:bg-blue-50/50 transition-colors border-b border-gray-50 ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
      }`}
    >
      <TableCell className="font-medium text-right py-4 px-6">
        <div className="font-semibold text-[#2F3C7E]">{lead.name as string}</div>
      </TableCell>
      <TableCell className="text-right py-4 px-6">
        <div className="text-gray-700">{(lead.phone as string) || '-'}</div>
      </TableCell>
      <TableCell className="text-right py-4 px-6">
        <div className="text-gray-700 truncate max-w-[200px]">{(lead.email as string) || '-'}</div>
      </TableCell>
      <TableCell className="text-right py-4 px-6">
        <Badge 
          variant="secondary" 
          className={`${lead.source ? 
            'bg-gradient-to-r from-blue-100 to-purple-100 text-[#2F3C7E] border-blue-200' : 
            'bg-gray-100 text-gray-600 border-gray-200'
          } font-medium`}
        >
          {(lead.source as string) || "ידני"}
        </Badge>
      </TableCell>
      <TableCell className="text-right py-4 px-6">
        <div className="text-sm text-gray-600">
          {new Date(lead.created_at as string).toLocaleDateString('he-IL')}
        </div>
      </TableCell>
      <TableCell className="text-right py-4 px-6">
        <QuickStatusChange lead={lead} />
      </TableCell>
      <TableCell className="py-4 px-6">
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
