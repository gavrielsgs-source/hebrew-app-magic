import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExtendSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtend: (days: number, reason?: string) => void;
  isLoading?: boolean;
}

export function ExtendSubscriptionDialog({
  open,
  onOpenChange,
  onExtend,
  isLoading,
}: ExtendSubscriptionDialogProps) {
  const [periodType, setPeriodType] = useState("preset");
  const [presetDays, setPresetDays] = useState("30");
  const [customDays, setCustomDays] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    const days = periodType === "preset" ? parseInt(presetDays) : parseInt(customDays);
    if (!days || days <= 0) return;
    
    onExtend(days, reason || undefined);
    onOpenChange(false);
    
    // איפוס הטופס
    setPeriodType("preset");
    setPresetDays("30");
    setCustomDays("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">הארכת מנוי</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-right block">בחר תקופה</Label>
            <Select value={periodType} onValueChange={setPeriodType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preset">תקופה מוגדרת מראש</SelectItem>
                <SelectItem value="custom">תקופה מותאמת אישית</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodType === "preset" ? (
            <div className="space-y-2">
              <Label className="text-right block">תקופה</Label>
              <Select value={presetDays} onValueChange={setPresetDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 ימים</SelectItem>
                  <SelectItem value="14">14 ימים</SelectItem>
                  <SelectItem value="30">30 ימים (חודש)</SelectItem>
                  <SelectItem value="90">90 ימים (3 חודשים)</SelectItem>
                  <SelectItem value="180">180 ימים (6 חודשים)</SelectItem>
                  <SelectItem value="365">365 ימים (שנה)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="custom-days" className="text-right block">
                מספר ימים
              </Label>
              <Input
                id="custom-days"
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="הכנס מספר ימים..."
                className="text-right"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-right block">
              סיבה (אופציונלי)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="למה המנוי מוארך..."
              className="text-right resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "מאריך..." : "אשר הארכה"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
