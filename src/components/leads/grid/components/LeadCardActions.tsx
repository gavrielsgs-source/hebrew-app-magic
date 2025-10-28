
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileActions } from "./actions/MobileActions";
import { DesktopActions } from "./actions/DesktopActions";
import { WhatsAppDialog } from "./dialogs/WhatsAppDialog";
import { ScheduleDialog } from "./dialogs/ScheduleDialog";
import { EditDialog } from "./dialogs/EditDialog";
import { DeleteDialog } from "./dialogs/DeleteDialog";
import { useLeadActions } from "./hooks/useLeadActions";

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
      {isMobile ? (
        <MobileActions {...wrappedHandlers} />
      ) : (
        <DesktopActions {...wrappedHandlers} />
      )}

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
