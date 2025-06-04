
import { useState } from "react";
import { useDeleteLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

export function useLeadActions(leadId: string, leadName: string) {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  
  const { toast } = useToast();
  const deleteLead = useDeleteLead();

  const handleWhatsAppClick = (leadPhone?: string) => {
    if (!leadPhone) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מספר טלפון עבור הליד",
        variant: "destructive",
      });
      return;
    }
    setShowWhatsappDialog(true);
  };

  const handleScheduleClick = () => {
    setShowScheduleDialog(true);
  };

  const handleEditClick = () => {
    console.log('Edit button clicked for lead:', leadId);
    setShowEditDialog(true);
  };

  const handleDeleteClick = () => {
    console.log('Delete button clicked for lead:', leadId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting lead:', leadId);
      await deleteLead.mutateAsync(leadId);
      toast({
        title: "ליד נמחק",
        description: "הליד נמחק בהצלחה מהמערכת",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "שגיאה במחיקת ליד",
        description: "לא ניתן למחוק את הליד. נסה שנית.",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
}
