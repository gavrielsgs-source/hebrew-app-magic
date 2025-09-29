
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "lucide-react";
import { LeadsTableRow } from "./LeadsTableRow";

interface LeadsTableContentProps {
  displayLeads: any[];
  isLoading: boolean;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string) => void;
  isWhatsappOpen: boolean;
  setIsWhatsappOpen: (open: boolean) => void;
  isScheduleOpen: boolean;
  setIsScheduleOpen: (open: boolean) => void;
  isEditLeadOpen: boolean;
  setIsEditLeadOpen: (open: boolean) => void;
}

export function LeadsTableContent({
  displayLeads,
  isLoading,
  selectedLeadId,
  setSelectedLeadId,
  isWhatsappOpen,
  setIsWhatsappOpen,
  isScheduleOpen,
  setIsScheduleOpen,
  isEditLeadOpen,
  setIsEditLeadOpen
}: LeadsTableContentProps) {
  return (
    <div className="lead-enhanced bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gradient-primary/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="leads-table-header bg-gradient-to-l from-primary/5 via-secondary/10 to-primary/5 border-b border-primary/15 backdrop-blur-sm">
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">שם</TableHead>
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">טלפון</TableHead>
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">אימייל</TableHead>
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">מקור</TableHead>
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">תאריך</TableHead>
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">סטטוס</TableHead>
            <TableHead className="text-right font-bold text-primary py-5 px-8 text-sm tracking-wide uppercase">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  טוען...
                </div>
              </TableCell>
            </TableRow>
          ) : displayLeads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <User className="h-12 w-12 text-gray-300" />
                  <p className="text-lg font-medium">אין לקוחות להצגה</p>
                  <p className="text-sm">הוסף לקוח חדש כדי להתחיל</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            displayLeads.map((lead, index) => (
              <LeadsTableRow
                key={lead.id}
                lead={lead}
                index={index}
                selectedLeadId={selectedLeadId}
                setSelectedLeadId={setSelectedLeadId}
                isWhatsappOpen={isWhatsappOpen}
                setIsWhatsappOpen={setIsWhatsappOpen}
                isScheduleOpen={isScheduleOpen}
                setIsScheduleOpen={setIsScheduleOpen}
                isEditLeadOpen={isEditLeadOpen}
                setIsEditLeadOpen={setIsEditLeadOpen}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
