import { useState } from "react";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

interface QuickNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
}

export function QuickNoteDialog({
  isOpen,
  onOpenChange,
  lead
}: QuickNoteDialogProps) {
  const [note, setNote] = useState("");
  const updateLead = useUpdateLead();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!note.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הזן הערה",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingNotes = lead.notes || "";
      const timestamp = new Date().toLocaleString('he-IL');
      const newNotes = existingNotes 
        ? `${existingNotes}\n\n[${timestamp}]\n${note}`
        : `[${timestamp}]\n${note}`;

      await updateLead.mutateAsync({
        id: lead.id,
        data: {
          notes: newNotes,
          updated_at: new Date().toISOString()
        }
      });

      toast({
        title: "הערה נוספה",
        description: "ההערה נוספה בהצלחה"
      });
      
      setNote("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את ההערה",
        variant: "destructive"
      });
    }
  };

  return (
    <SwipeDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[500px]">
        <DialogHeader>
          <DialogTitle>הוסף הערה - {lead.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" dir="rtl">
          <Textarea
            placeholder="כתוב הערה..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[120px]"
            dir="rtl"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateLead.isPending} className="flex-1">
              {updateLead.isPending ? "שומר..." : "שמור"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </SwipeDialog>
  );
}
