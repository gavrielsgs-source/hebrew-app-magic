
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileActions } from "./actions/MobileActions";
import { DesktopActions } from "./actions/DesktopActions";
import { WhatsAppDialog } from "./dialogs/WhatsAppDialog";
import { ScheduleDialog } from "./dialogs/ScheduleDialog";
import { EditDialog } from "./dialogs/EditDialog";
import { DeleteDialog } from "./dialogs/DeleteDialog";
import { useLeadActions } from "./hooks/useLeadActions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useUpdateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

interface LeadCardActionsProps {
  lead: any;
  onEdit: () => void;
  onDelete: () => void;
  onWhatsApp: () => void;
  onSchedule: () => void;
}

export function LeadCardActions({ 
  lead,
  onEdit, 
  onDelete, 
  onWhatsApp, 
  onSchedule 
}: LeadCardActionsProps) {
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState(lead.notes || "");
  const updateLead = useUpdateLead();
  const { toast } = useToast();
  
  const {
    showScheduleDialog,
    setShowScheduleDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    showWhatsappDialog,
    setShowWhatsappDialog,
    handleWhatsAppClick,
    handleScheduleClick,
    handleEditClick,
    handleDeleteClick,
    handleConfirmDelete
  } = useLeadActions(lead.id, lead.name);

  const handleSaveNotes = async () => {
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        data: {
          notes,
          updated_at: new Date().toISOString()
        }
      });

      toast({
        title: "הערות נשמרו",
        description: "ההערות עודכנו בהצלחה"
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערות",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveNotes();
    }
  };

  const wrappedHandlers = {
    onWhatsApp: () => {
      handleWhatsAppClick(lead.phone);
      onWhatsApp();
    },
    onSchedule: () => {
      handleScheduleClick();
      onSchedule();
    },
    onEdit: () => {
      handleEditClick();
      onEdit();
    },
    onDelete: () => {
      handleDeleteClick();
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-2">
          {isMobile ? (
            <MobileActions {...wrappedHandlers} />
          ) : (
            <DesktopActions {...wrappedHandlers} />
          )}
        </div>
        
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300" dir="rtl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent rounded-2xl pointer-events-none"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Save className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">הערות ומעקב</span>
            </div>
            <div className="relative">
              <Textarea
                placeholder="הוסף הערות על השיחה, מעקב, פגישות וכו'... (Ctrl+Enter לשמירה)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] text-sm resize-none bg-background/50 border-primary/20 focus:border-primary/40 focus:ring-primary/20 rounded-xl"
                dir="rtl"
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={updateLead.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Save className="h-3 w-3 ml-1" />
                  {updateLead.isPending ? "שומר..." : "שמור הערות"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppDialog
        isOpen={showWhatsappDialog}
        onOpenChange={setShowWhatsappDialog}
        leadId={lead.id}
        leadName={lead.name}
        leadPhone={lead.phone || ""}
        leadSource={lead.source}
      />

      <ScheduleDialog
        isOpen={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        leadId={lead.id}
        leadName={lead.name}
        leadPhone={lead.phone}
      />

      <EditDialog
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        lead={lead}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        leadName={lead.name}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
