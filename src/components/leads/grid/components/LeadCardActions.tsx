
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Phone, Send, Calendar, Edit, Trash2 } from "lucide-react";
import { EditLeadForm } from "../../EditLeadForm";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { useState } from "react";
import { useDeleteLead } from "@/hooks/use-leads";
import { toast } from "sonner";
import { LeadReminders } from "../LeadReminders";

interface LeadCardActionsProps {
  lead: any;
  canManageLeads: boolean;
}

export function LeadCardActions({ lead, canManageLeads }: LeadCardActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteLead = useDeleteLead();

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("הלקוח נמחק בהצלחה");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("שגיאה במחיקת לקוח:", error);
      toast.error("אירעה שגיאה במחיקת הלקוח");
    }
  };

  return (
    <CardFooter className="bg-slate-50 p-3 flex justify-between gap-2">
      <div className="flex space-x-2 rtl:space-x-reverse">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                disabled={!lead.phone}
                onClick={() => {
                  if (lead.phone) {
                    window.open(`tel:${lead.phone}`, '_blank');
                  }
                }}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>התקשר</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {lead.cars && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      disabled={!lead.phone}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
                    </DialogHeader>
                    <WhatsappTemplateSelector 
                      car={lead.cars} 
                      initialPhoneNumber={lead.phone || ""}
                      onClose={() => {}}
                    />
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>שלח בוואטסאפ</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>תזכורות לקוח</DialogTitle>
                  </DialogHeader>
                  <LeadReminders lead={lead} canAddReminder={true} />
                </DialogContent>
              </Dialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>נהל תזכורות</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {canManageLeads && (
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8"
              >
                <Edit className="h-3.5 w-3.5 ml-1" />
                ערוך
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px]">
              <SheetHeader>
                <SheetTitle>עריכת לקוח</SheetTitle>
              </SheetHeader>
              <EditLeadForm lead={lead} />
            </SheetContent>
          </Sheet>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8"
              >
                <Trash2 className="h-3.5 w-3.5 ml-1" />
                מחק
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>מחיקת לקוח</DialogTitle>
                <DialogDescription>
                  האם אתה בטוח שברצונך למחוק את הלקוח? פעולה זו לא ניתנת לביטול.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  ביטול
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteLead.isPending}
                >
                  {deleteLead.isPending ? "מוחק..." : "מחק"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </CardFooter>
  );
}
