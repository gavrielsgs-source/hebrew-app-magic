import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ChangeLeadLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLimit: number | null;
  onChangeLimit: (maxLeads: number | null) => void;
  isLoading?: boolean;
}

export function ChangeLeadLimitDialog({
  open,
  onOpenChange,
  currentLimit,
  onChangeLimit,
  isLoading,
}: ChangeLeadLimitDialogProps) {
  const [useDefault, setUseDefault] = useState(currentLimit === null);
  const [limit, setLimit] = useState(currentLimit?.toString() || "");

  const handleSubmit = () => {
    if (useDefault) {
      onChangeLimit(null);
    } else {
      const num = parseInt(limit);
      if (!isNaN(num) && num > 0) {
        onChangeLimit(num);
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>שינוי מגבלת לידים</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="use-default">ברירת מחדל (לפי חבילה)</Label>
            <Switch
              id="use-default"
              checked={useDefault}
              onCheckedChange={(checked) => {
                setUseDefault(checked);
                if (checked) setLimit("");
              }}
            />
          </div>
          {!useDefault && (
            <div className="space-y-2">
              <Label htmlFor="lead-limit">מגבלת לידים</Label>
              <Input
                id="lead-limit"
                type="number"
                min="1"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="הזן מספר לידים"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading || (!useDefault && (!limit || parseInt(limit) <= 0))}>
            שמור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
