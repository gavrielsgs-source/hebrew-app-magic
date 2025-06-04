
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileActions } from "./actions/MobileActions";
import { DesktopActions } from "./actions/DesktopActions";
import { WhatsAppDialog } from "./dialogs/WhatsAppDialog";
import { ScheduleDialog } from "./dialogs/ScheduleDialog";
import { EditDialog } from "./dialogs/EditDialog";
import { DeleteDialog } from "./dialogs/DeleteDialog";
import { useLeadActions } from "./hooks/useLeadActions";

interface LeadCardActionsProps {
  leadId: string;
  leadName: string;
  leadPhone?: string;
  leadSource?: string;
  onEdit: () => void;
  onDelete: () => void;
  onWhatsApp: () => void;
  onSchedule: () => void;
}

export function LeadCardActions({ 
  leadId, 
  leadName, 
  leadPhone, 
  leadSource,
  onEdit, 
  onDelete, 
  onWhatsApp, 
  onSchedule 
}: LeadCardActionsProps) {
  const isMobile = useIsMobile();
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
  } = useLeadActions(leadId, leadName);

  const wrappedHandlers = {
    onWhatsApp: () => {
      handleWhatsAppClick(leadPhone);
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
      {isMobile ? (
        <MobileActions {...wrappedHandlers} />
      ) : (
        <DesktopActions {...wrappedHandlers} />
      )}

      <WhatsAppDialog
        isOpen={showWhatsappDialog}
        onOpenChange={setShowWhatsappDialog}
        leadId={leadId}
        leadName={leadName}
        leadPhone={leadPhone || ""}
        leadSource={leadSource}
      />

      <ScheduleDialog
        isOpen={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        leadId={leadId}
        leadName={leadName}
        leadPhone={leadPhone}
      />

      <EditDialog
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        leadId={leadId}
        leadName={leadName}
        leadPhone={leadPhone}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        leadName={leadName}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
