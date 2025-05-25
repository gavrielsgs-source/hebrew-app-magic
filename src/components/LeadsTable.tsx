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
import { Phone, MessageSquare, Send, Plus, Edit, Calendar } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddLeadForm } from "./leads/AddLeadForm";
import { useState } from "react";
import { EditLeadForm } from "./leads/EditLeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { getStatusBadgeColor, getStatusText } from "./leads/grid/utils/lead-status";

interface LeadsTableProps {
  searchTerm?: string;
  filteredLeads?: any[];
}

export function LeadsTable({ searchTerm = "", filteredLeads }: LeadsTableProps) {
  const { leads, isLoading } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  
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
      <div className="flex justify-between items-center mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
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
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">טלפון</TableHead>
              <TableHead className="text-right">אימייל</TableHead>
              <TableHead className="text-right">מקור</TableHead>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  טוען...
                </TableCell>
              </TableRow>
            ) : displayLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  אין לקוחות להצגה
                </TableCell>
              </TableRow>
            ) : (
              displayLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-right">{lead.name}</TableCell>
                  <TableCell className="text-right">{lead.phone}</TableCell>
                  <TableCell className="text-right">{lead.email}</TableCell>
                  <TableCell className="text-right">{lead.source || "ידני"}</TableCell>
                  <TableCell className="text-right">{new Date(lead.created_at).toLocaleDateString('he-IL')}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getStatusBadgeColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 space-x-reverse justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
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
                      
                      <Button variant="ghost" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
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
