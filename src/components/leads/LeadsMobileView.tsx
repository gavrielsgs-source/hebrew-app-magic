import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, MessageSquare, Calendar, Edit, Plus, Trash2, Users, CheckCircle } from "lucide-react";
import { EditLeadForm } from "./EditLeadForm";
import { getStatusBadgeColor, getStatusText } from "./grid/utils/lead-status";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useDeleteLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { QuickStatusChange } from "./QuickStatusChange";

export function LeadsMobileView({ leads, isLoading, error }: { leads: any[]; isLoading: boolean; error?: Error | null }) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<"edit" | "task" | "clients" | null>(null);
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

  const formatPhoneForWhatsApp = (phone: string) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // If already starts with 972, return as is
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // If starts with 0, replace with 972
    if (cleanPhone.startsWith('0')) {
      return '972' + cleanPhone.substring(1);
    }
    
    // If doesn't start with 972 or 0, add 972 prefix
    return '972' + cleanPhone;
  };

  const handleWhatsAppMessage = (phone: string, name: string) => {
    if (phone) {
      const message = `שלום ${name}, איך אתה? אני מעוניין לדבר איתך על רכב`;
      const formattedPhone = formatPhoneForWhatsApp(phone);
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="space-y-4 p-4 pb-24">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl overflow-hidden">
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-3xl text-center max-w-md w-full">
          <div className="mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-red-500" />
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
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-6 mb-6">
            <Users className="h-12 w-12 text-[#2F3C7E]" />
          </div>
          <h3 className="font-bold text-2xl mb-3 text-gray-900">אין לקוחות פוטנציאליים</h3>
          <p className="text-gray-500 text-lg mb-6 leading-relaxed">הוסף את הלקוח הראשון שלך כדי להתחיל לעקוב ולנהל לידים</p>
          <Button 
            className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] text-white text-lg py-4 px-8 rounded-2xl shadow-lg"
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
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="space-y-4 p-4 pb-24">
        {leads.map((lead) => (
          <Card key={lead.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl border-0 bg-white">
            <CardHeader className="pb-4 bg-gradient-to-l from-slate-50 via-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-[#2F3C7E] mb-3 leading-tight">{lead.name}</h3>
                  <div className="text-left">
                    <QuickStatusChange lead={lead} />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-[#2F3C7E] hover:bg-[#2F3C7E]/10 h-12 w-12 rounded-2xl"
                  onClick={() => {
                    setSelectedLeadId(lead.id);
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
                  <div className="flex justify-between items-center bg-gradient-to-l from-blue-50 to-white p-4 rounded-2xl border border-blue-100">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl px-4 py-2 font-semibold"
                      onClick={() => handleCallLead(lead.phone)}
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                    <div className="text-right flex-1 mr-4">
                      <div className="font-bold text-lg" dir="ltr">{lead.phone}</div>
                      <div className="text-sm text-gray-600">טלפון</div>
                    </div>
                  </div>
                )}
                
                {lead.email && (
                  <div className="flex items-center bg-gradient-to-l from-purple-50 to-white p-4 rounded-2xl border border-purple-100">
                    <div className="text-right flex-1">
                      <div className="font-semibold text-gray-900 truncate">{lead.email}</div>
                      <div className="text-sm text-gray-600">אימייל</div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-purple-600 mr-3" />
                  </div>
                )}
                
                {lead.source && (
                  <div className="flex items-center bg-gradient-to-l from-green-50 to-white p-4 rounded-2xl border border-green-100">
                    <div className="text-right flex-1">
                      <div className="font-semibold text-gray-900">{lead.source}</div>
                      <div className="text-sm text-gray-600">מקור הליד</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  </div>
                )}
              </div>
              
              {/* כפתורי פעולה ראשיים */}
              <div className="space-y-3">
                {/* שורה ראשונה - פעולות ראשיות */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl py-4 h-16 shadow-lg font-bold text-lg"
                    disabled={!lead.phone}
                    onClick={() => handleWhatsAppMessage(lead.phone, lead.name)}
                  >
                    <MessageSquare className="h-6 w-6 ml-2" />
                    וואטסאפ
                  </Button>

                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white rounded-2xl py-4 h-16 shadow-lg font-bold text-lg"
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setActiveDialog("task");
                    }}
                  >
                    <Calendar className="h-6 w-6 ml-2" />
                    קבע פגישה
                  </Button>
                </div>

                {/* שורה שנייה - פעולות משניות */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-2xl py-4 h-14 font-semibold"
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setActiveDialog("clients");
                    }}
                  >
                    <Users className="h-5 w-5 ml-2" />
                    שתף ליד
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-2xl py-4 h-14 font-semibold"
                    onClick={() => {
                      setLeadToDelete(lead.id);
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
        <DialogContent className="w-full max-w-md mx-4 rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2F3C7E]">עריכת ליד</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <EditLeadForm 
              lead={selectedLead} 
              onSuccess={() => setActiveDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={activeDialog === "task"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="w-full max-w-md mx-4 rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2F3C7E]">קביעת פגישה</DialogTitle>
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
        <DialogContent className="w-full max-w-md mx-4 rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2F3C7E]">שיתוף ליד</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-[#2F3C7E]" />
            </div>
            <p className="mb-4 text-lg font-semibold text-gray-700">תכונה זו תהיה זמינה בקרוב</p>
            <p className="text-sm text-gray-500 leading-relaxed">תוכל לשלוח פרטי ליד ללקוחות קיימים במערכת ולשתף מידע בצורה מהירה ובטוחה</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-full max-w-md mx-4 rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">מחיקת ליד</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <p className="mb-2 text-lg font-semibold">האם אתה בטוח?</p>
            <p className="text-gray-600 mb-6 leading-relaxed">פעולה זו תמחק את הליד לצמיתות ולא ניתן יהיה לשחזר אותו</p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 py-3 rounded-2xl font-semibold"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 py-3 rounded-2xl font-semibold"
                onClick={handleDeleteLead}
              >
                מחק לצמיתות
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
