import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, MessageSquare, Calendar, Edit, Send, Plus, Trash2, Users } from "lucide-react";
import { EditLeadForm } from "./EditLeadForm";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { getStatusBadgeColor, getStatusText } from "./grid/utils/lead-status";
import { LeadReminders } from "./grid/LeadReminders";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useLeads, useDeleteLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { QuickStatusChange } from "./QuickStatusChange";

// Helper function to get status colors according to new design
const getLeadStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return "bg-blue-500 text-white";
    case 'hot':
      return "bg-red-500 text-white";
    case 'closed':
    case 'converted':
      return "bg-gray-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
};

export function LeadsMobileView({ leads, isLoading, error }: { leads: any[]; isLoading: boolean; error?: Error | null }) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<"edit" | "whatsapp" | "task" | "clients" | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const deleteLead = useDeleteLead();
  
  const selectedLead = selectedLeadId 
    ? leads.find(lead => lead.id === selectedLeadId) 
    : null;

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    
    try {
      await deleteLead.mutateAsync(leadToDelete);
      toast({
        title: "ליד נמחק",
        description: "הליד נמחק בהצלחה מהמערכת",
      });
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
    } catch (error) {
      toast({
        title: "שגיאה במחיקת ליד",
        description: "לא ניתן למחוק את הליד. נסה שנית.",
        variant: "destructive",
      });
    }
  };

  const handleCallLead = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse rounded-2xl">
            <CardHeader className="pb-2">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl" dir="rtl">
        <p className="font-semibold">שגיאה בטעינת הלקוחות</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center" dir="rtl">
        <div className="bg-slate-100 rounded-full p-3 mb-3">
          <MessageSquare className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="font-medium text-lg mb-1">אין לקוחות פוטנציאליים</h3>
        <p className="text-slate-500 text-sm mb-4">הוסף את הלקוח הראשון שלך להתחיל</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {leads.map((lead) => (
        <Card key={lead.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl border border-gray-100">
          <CardHeader className="pb-3 bg-gradient-to-l from-slate-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-xl text-[#2F3C7E] mb-2">{lead.name}</div>
                <QuickStatusChange lead={lead} />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10"
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  setActiveDialog("edit");
                }}
              >
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              {lead.phone && (
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 ml-2 text-[#2F3C7E]" />
                    <span dir="ltr" className="font-medium">{lead.phone}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"
                    onClick={() => handleCallLead(lead.phone)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {lead.email && (
                <div className="flex items-center bg-slate-50 p-3 rounded-xl">
                  <MessageSquare className="h-4 w-4 ml-2 text-[#2F3C7E]" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{lead.email}</span>
                </div>
              )}
              
              {lead.source && (
                <div className="flex items-center bg-slate-50 p-3 rounded-xl">
                  <span className="text-sm ml-2 font-bold text-[#2F3C7E]">מקור:</span>
                  <span className="text-sm font-medium">{lead.source}</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
              {/* WhatsApp Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center"
                disabled={!lead.phone}
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  setActiveDialog("whatsapp");
                }}
              >
                <MessageSquare className="h-4 w-4 ml-1" />
                וואטסאפ
              </Button>

              {/* Task Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white flex items-center justify-center"
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  setActiveDialog("task");
                }}
              >
                <Calendar className="h-4 w-4 ml-1" />
                משימה
              </Button>

              {/* Send to Client Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white flex items-center justify-center"
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  setActiveDialog("clients");
                }}
              >
                <Users className="h-4 w-4 ml-1" />
                שלח ללקוח
              </Button>

              {/* Delete Button */}
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center"
                onClick={() => {
                  setLeadToDelete(lead.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 ml-1" />
                מחק
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Lead Dialog */}
      <Dialog open={activeDialog === "edit"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="w-full max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת ליד</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <EditLeadForm 
              lead={selectedLead} 
              onSuccess={() => setActiveDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      <Dialog open={activeDialog === "whatsapp"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="w-full max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>שליחת הודעת וואטסאפ</DialogTitle>
          </DialogHeader>
          {selectedLead?.phone && (
            <div className="p-4">
              <p className="mb-4">שליחת הודעה ל: {selectedLead.name}</p>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={() => {
                  const message = `שלום ${selectedLead.name}, אני מעוניין להציע לך רכב מתאים. האם תוכל לחזור אלי?`;
                  window.open(`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                  setActiveDialog(null);
                }}
              >
                שלח הודעה
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={activeDialog === "task"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="w-full max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת משימה חדשה</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <TaskForm 
              initialLeadId={selectedLead.id}
              onSuccess={() => setActiveDialog(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Send to Client Dialog */}
      <Dialog open={activeDialog === "clients"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="w-full max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>שליחה ללקוח קיים</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="mb-4 text-center text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
            <p className="text-sm text-center text-gray-500">תוכל לשלוח פרטי ליד ללקוחות קיימים במערכת</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-full max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת ליד</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="mb-4">האם אתה בטוח שברצונך למחוק את הליד?</p>
            <p className="text-sm text-gray-600 mb-6">פעולה זו לא ניתנת לביטול</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleDeleteLead}
              >
                מחק
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
