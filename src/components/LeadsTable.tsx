
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Send, Plus, Edit, Calendar, User } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddLeadForm } from "./leads/AddLeadForm";
import { useState } from "react";
import { EditLeadForm } from "./leads/EditLeadForm";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { ScheduleMeetingForm } from "./leads/ScheduleMeetingForm";
import { getStatusBadgeColor, getStatusText } from "./leads/grid/utils/lead-status";
import { QuickStatusChange } from "./leads/QuickStatusChange";

interface LeadsTableProps {
  searchTerm?: string;
  filteredLeads?: any[];
}

export function LeadsTable({ searchTerm = "", filteredLeads }: LeadsTableProps) {
  const { leads, isLoading } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  
  const selectedLead = selectedLeadId 
    ? leads.find(lead => lead.id === selectedLeadId) 
    : null;
  
  // Use filtered leads if provided, otherwise use original logic
  const displayLeads = filteredLeads || (searchTerm
    ? leads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : leads);
  
  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white shadow-lg">
              <Plus className="ml-2 h-4 w-4" /> הוסף לקוח חדש
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]" dir="rtl">
            <SheetHeader>
              <SheetTitle>הוסף לקוח חדש</SheetTitle>
            </SheetHeader>
            <AddLeadForm />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-l from-slate-50 via-blue-50 to-white border-b border-blue-100">
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">שם</TableHead>
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">טלפון</TableHead>
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">אימייל</TableHead>
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">מקור</TableHead>
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">תאריך</TableHead>
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">סטטוס</TableHead>
              <TableHead className="text-right font-semibold text-[#2F3C7E] py-4 px-6">פעולות</TableHead>
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
                <TableRow 
                  key={lead.id} 
                  className={`hover:bg-blue-50/50 transition-colors border-b border-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <TableCell className="font-medium text-right py-4 px-6">
                    <div className="font-semibold text-[#2F3C7E]">{lead.name}</div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="text-gray-700">{lead.phone || '-'}</div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="text-gray-700 truncate max-w-[200px]">{lead.email || '-'}</div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <Badge 
                      variant="secondary" 
                      className={`${lead.source ? 
                        'bg-gradient-to-r from-blue-100 to-purple-100 text-[#2F3C7E] border-blue-200' : 
                        'bg-gray-100 text-gray-600 border-gray-200'
                      } font-medium`}
                    >
                      {lead.source || "ידני"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="text-sm text-gray-600">
                      {new Date(lead.created_at).toLocaleDateString('he-IL')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <QuickStatusChange lead={lead} />
                  </TableCell>
                  <TableCell className="py-4 px-6">
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
                      
                      <Dialog open={isWhatsappOpen} onOpenChange={setIsWhatsappOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            disabled={!lead.cars}
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
                              initialPhoneNumber={lead.phone || ""}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isScheduleOpen && selectedLeadId === lead.id} onOpenChange={(open) => {
                        setIsScheduleOpen(open);
                        if (open) setSelectedLeadId(lead.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                            onClick={() => setSelectedLeadId(lead.id)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>קבע פגישה/תזכורת - {lead.name}</DialogTitle>
                          </DialogHeader>
                          <ScheduleMeetingForm 
                            lead={lead} 
                            onSuccess={() => setIsScheduleOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                            onClick={() => setSelectedLeadId(lead.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px]" dir="rtl">
                          <SheetHeader>
                            <SheetTitle>עריכת לקוח</SheetTitle>
                          </SheetHeader>
                          {selectedLead && <EditLeadForm lead={selectedLead} />}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
