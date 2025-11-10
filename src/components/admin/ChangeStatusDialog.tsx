import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  onChangeStatus: (newStatus: string, reason?: string) => void;
  isLoading?: boolean;
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  onChangeStatus,
  isLoading,
}: ChangeStatusDialogProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (newStatus === currentStatus) return;
    onChangeStatus(newStatus, reason || undefined);
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">שינוי סטטוס מנוי</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-right block">סטטוס נוכחי</Label>
            <div className="text-sm text-muted-foreground text-right">
              {getStatusLabel(currentStatus)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-right block">סטטוס חדש</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="trial">ניסיון</SelectItem>
                <SelectItem value="past_due">תשלום נכשל</SelectItem>
                <SelectItem value="expired">פג תוקף</SelectItem>
                <SelectItem value="cancelled">מבוטל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-right block">
              סיבה (אופציונלי)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="למה הסטטוס משתנה..."
              className="text-right resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || newStatus === currentStatus}
          >
            {isLoading ? "משנה..." : "אשר שינוי"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: "פעיל",
    trial: "ניסיון",
    past_due: "תשלום נכשל",
    expired: "פג תוקף",
    cancelled: "מבוטל",
  };
  return labels[status] || status;
}
