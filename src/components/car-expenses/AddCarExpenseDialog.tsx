import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddCarExpense } from "@/hooks/car-expenses";
import { EXPENSE_TYPES } from "@/types/car-expense";
import { Paperclip } from "lucide-react";

interface AddCarExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
}

export const AddCarExpenseDialog = ({ open, onOpenChange, carId }: AddCarExpenseDialogProps) => {
  const addExpense = useAddCarExpense();
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    expense_type: 'repair',
    description: '',
    amount: '',
    include_vat: true,
    vat_rate: 17,
    invoice_number: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    if (formData.include_vat) {
      return amount * (1 + formData.vat_rate / 100);
    }
    return amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addExpense.mutateAsync({
      car_id: carId,
      expense_date: formData.expense_date,
      expense_type: formData.expense_type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      include_vat: formData.include_vat,
      vat_rate: formData.vat_rate,
      invoice_number: formData.invoice_number || undefined,
      document: uploadedFile || undefined,
    });

    // Reset form
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: 'repair',
      description: '',
      amount: '',
      include_vat: true,
      vat_rate: 17,
      invoice_number: '',
    });
    setUploadedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>הוסף הוצאה לרכב</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="expense_date">תאריך</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="expense_type">סוג הוצאה</Label>
            <Select value={formData.expense_type} onValueChange={(value) => setFormData({ ...formData, expense_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">תיאור</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="תיאור ההוצאה"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">סכום (₪)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            <RadioGroup
              value={formData.include_vat ? "with" : "without"}
              onValueChange={(value) => setFormData({ ...formData, include_vat: value === "with" })}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="with" id="with-vat" />
                <Label htmlFor="with-vat" className="cursor-pointer">עם מע״מ</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="without" id="without-vat" />
                <Label htmlFor="without-vat" className="cursor-pointer">בלי מע״מ</Label>
              </div>
            </RadioGroup>
            {formData.amount && (
              <p className="text-sm text-muted-foreground mt-2">
                סה״כ: ₪{calculateTotal().toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="invoice_number">מספר חשבונית (אופציונלי)</Label>
            <Input
              id="invoice_number"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              placeholder="מספר חשבונית או קבלה"
            />
          </div>

          <div>
            <Label htmlFor="document">העלאת מסמך (אופציונלי)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => window.document.getElementById('document')?.click()}
                className="w-full"
              >
                <Paperclip className="ml-2 h-4 w-4" />
                {uploadedFile ? uploadedFile.name : 'בחר קובץ...'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={addExpense.isPending}>
              {addExpense.isPending ? 'שומר...' : 'שמור הוצאה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
