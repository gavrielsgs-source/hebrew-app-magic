import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [useCustom, setUseCustom] = useState(false);
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (open) {
      const hasCustom = currentLimit !== null;
      setUseCustom(hasCustom);
      setLimit(hasCustom ? currentLimit.toString() : "");
    }
  }, [open, currentLimit]);

  const handleSubmit = () => {
    if (!useCustom) {
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
          <DialogDescription>
            הגדר מגבלת לידים מותאמת אישית למשתמש זה, או השאר לפי ברירת מחדל של החבילה.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-custom"
              checked={useCustom}
              onCheckedChange={(checked) => {
                setUseCustom(!!checked);
                if (!checked) setLimit("");
              }}
            />
            <Label htmlFor="use-custom" className="cursor-pointer">
              הגדר מגבלה מותאמת אישית
            </Label>
          </div>

          {useCustom && (
            <div className="space-y-2 pr-6">
              <Label htmlFor="lead-limit">מספר לידים מקסימלי</Label>
              <Input
                id="lead-limit"
                type="number"
                min="1"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="למשל: 100"
                autoFocus
              />
              {limit && parseInt(limit) > 0 && (
                <p className="text-sm text-muted-foreground">
                  המשתמש יוגבל ל-{parseInt(limit)} לידים
                </p>
              )}
            </div>
          )}

          {!useCustom && (
            <p className="text-sm text-muted-foreground pr-6">
              המשתמש ישתמש במגבלת הלידים של החבילה שלו.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (useCustom && (!limit || parseInt(limit) <= 0))}
          >
            שמור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
