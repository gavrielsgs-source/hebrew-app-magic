
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, MessageSquare, Edit, Plus, Trash2, Users, CheckCircle } from "lucide-react";
import { EditLeadForm } from "./EditLeadForm";
import { getStatusBadgeColor, getStatusText } from "./grid/utils/lead-status";
import { useDeleteLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { QuickStatusChange } from "./QuickStatusChange";
import { WhatsappLeadTemplateSelector } from "@/components/whatsapp/WhatsappLeadTemplateSelector";

export function LeadsMobileView({ leads, isLoading, error }: { leads: any[]; isLoading: boolean; error?: Error | null }) {
  console.log('LeadsMobileView rendered with:', { leads: leads?.length, isLoading, error });
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<"edit" | "whatsapp" | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const deleteLead = useDeleteLead();
  
  const selectedLead = selectedLeadId 
    ? leads?.find(lead => lead.id === selectedLeadId) 
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

  const handleWhatsAppMessage = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActiveDialog("whatsapp");
  };

  // Loading state
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <div className="space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-100">
              <CardHeader className="pb-3">
                <div className="h-8 bg-slate-200 rounded-xl mb-2"></div>
                <div className="h-6 bg-slate-200 rounded-lg w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-slate-200 rounded-xl mb-3"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 bg-slate-200 rounded-xl"></div>
                  <div className="h-12 bg-slate-200 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log('Showing error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-24" dir="rtl">
        <div className="bg-white border border-gray-200 text-gray-700 p-6 rounded-3xl text-center max-w-md w-full shadow-md">
          <div className="mb-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <p className="font-bold text-lg mb-2">שגיאה בטעינת הלקוחות</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!leads || leads.length === 0) {
    console.log('Showing empty state');
    return (
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="bg-white rounded-full p-6 mb-6 border border-gray-200 shadow-sm">
            <Users className="h-12 w-12 text-[#2F3C7E]" />
          </div>
          <h3 className="font-bold text-2xl mb-3 text-gray-900">אין לקוחות פוטנציאליים</h3>
          <p className="text-gray-500 text-lg mb-6 leading-relaxed">הוסף את הלקוח הראשון שלך כדי להתחיל לעקוב ולנהל לידים</p>
          <Button 
            className="bg-[#2F3C7E] hover:bg-[#1A2347] text-white text-lg py-4 px-8 rounded-2xl shadow-md"
            size="lg"
          >
            <Plus className="h-6 w-6 ml-2" />
            הוסף לקוח ראשון
          </Button>
        </div>
      </div>
    );
  }

  // Main content
  console.log('Showing main content with leads:', leads.length);
  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <div className="space-y-4 p-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-3xl border border-gray-100 bg-white">
            <CardHeader className="pb-4 bg-white border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-[#2F3C7E] mb-3 leading-tight">{lead.name as string}</h3>
                  <div className="text-left">
                    <QuickStatusChange lead={lead} />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-600 hover:bg-gray-100 h-12 w-12 rounded-2xl"
                  onClick={() => {
                    setSelectedLeadId(lead.id as string);
                    setActiveDialog("edit");
                  }}
                >
                  <Edit className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* פרטי קשר */}
              <div className="space-y-4 mb-6">
                {lead.phone && (
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2 font-semibold"
                      onClick={() => handleCallLead(lead.phone as string)}
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                    <div className="text-right flex-1 mr-4">
                      <div className="font-bold text-lg" dir="ltr">{lead.phone as string}</div>
                      <div className="text-sm text-gray-600">טלפון</div>
                    </div>
                  </div>
                )}
                
                {lead.email && (
                  <div className="flex items-center bg-white p-4 rounded-2xl border border-gray-200">
                    <div className="text-right flex-1">
                      <div className="font-semibold text-gray-900 truncate">{lead.email as string}</div>
                      <div className="text-sm text-gray-600">אימייל</div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-gray-500 mr-3" />
                  </div>
                )}
                
                {lead.source && (
                  <div className="flex items-center bg-white p-4 rounded-2xl border border-gray-200">
                    <div className="text-right flex-1">
                      <div className="font-semibold text-gray-900">{lead.source as string}</div>
                      <div className="text-sm text-gray-600">מקור הליד</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-gray-500 mr-3" />
                  </div>
                )}
              </div>
              
              {/* כפתורי פעולה ראשיים */}
              <div className="space-y-3">
                {/* שורה ראשונה - פעולות ראשיות */}
                <div className="grid grid-cols-1 gap-3">
                  {/* WhatsApp button hidden - will be re-enabled later */}

                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-2xl py-4 h-16 font-semibold"
                    onClick={() => {
                      setLeadToDelete(lead.id as string);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-5 w-5 ml-2" />
                    מחק
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Lead Dialog */}
      <Dialog open={activeDialog === "edit"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת לקוח</DialogTitle>
          </DialogHeader>
          {selectedLead && <EditLeadForm lead={selectedLead} />}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Template Dialog */}
      <Dialog open={activeDialog === "whatsapp"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>שליחת הודעה בוואטסאפ</DialogTitle>
          </DialogHeader>
          {selectedLead && selectedLead.phone && (
            <WhatsappLeadTemplateSelector
              leadName={selectedLead.name as string}
              leadPhone={selectedLead.phone as string}
              leadSource={selectedLead.source as string}
              onClose={() => setActiveDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת ליד</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>האם אתה בטוח שברצונך למחוק את הליד הזה? פעולה זו לא ניתנת לביטול.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDeleteLead}>
              מחק
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
