import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ChangeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
  onChangeTier: (newTier: string, reason?: string) => void;
  isLoading?: boolean;
}

export function ChangeTierDialog({
  open,
  onOpenChange,
  currentTier,
  onChangeTier,
  isLoading,
}: ChangeTierDialogProps) {
  const [newTier, setNewTier] = useState(currentTier);
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (newTier === currentTier) return;
    onChangeTier(newTier, reason || undefined);
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">שינוי חבילה</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-right block">חבילה נוכחית</Label>
            <div className="text-sm text-muted-foreground text-right">
              {getTierLabel(currentTier)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-right block">חבילה חדשה</Label>
            <Select value={newTier} onValueChange={setNewTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">חינם</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
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
              placeholder="למה החבילה משתנה..."
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
            disabled={isLoading || newTier === currentTier}
          >
            {isLoading ? "משנה..." : "אשר שינוי"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    free: "חינם",
    premium: "Premium",
    business: "Business",
    enterprise: "Enterprise",
  };
  return labels[tier] || tier;
}
