
import { useState, useEffect } from "react";
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
  
  useEffect(() => {
    setNotes(lead.notes || "");
  }, [lead.id]);
  
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
      
      // מנקה את ה-textarea אחרי שמירה מוצלחת
      setNotes("");
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
        
        <div className="rounded-xl border border-muted/40 bg-muted/10 p-3 mt-6" dir="rtl">
          <div className="text-xs font-semibold text-muted-foreground mb-2">הערות</div>
          <div>
            <Textarea
              placeholder="הוסף הערות קצרות... (Ctrl+Enter לשמירה)"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 300))}
              onKeyDown={handleKeyDown}
              maxLength={300}
              className="min-h-[72px] max-h-40 text-xs resize-y bg-background/60 border-muted/40 focus:border-primary/40 focus:ring-primary/20 rounded-lg max-w-sm ml-auto"
              dir="rtl"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{notes?.length || 0}/300</span>
              {updateLead.isPending && <span>שומר...</span>}
            </div>
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={updateLead.isPending}
                className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                <Save className="h-3 w-3 ml-1" />
                {updateLead.isPending ? "שומר..." : "שמור"}
              </Button>
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
