
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
        
        <div className="space-y-2" dir="rtl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">הערות</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveNotes}
              disabled={updateLead.isPending}
              className="h-7 px-2"
            >
              <Save className="h-3 w-3 ml-1" />
              {updateLead.isPending ? "שומר..." : "שמור"}
            </Button>
          </div>
          <Textarea
            placeholder="הוסף הערות על השיחה, מעקב, וכו'..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] text-sm resize-none"
            dir="rtl"
          />
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
