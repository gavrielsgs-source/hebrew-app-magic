import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateCustomerDocument } from "@/hooks/customers";

interface CreateCustomerDocumentDialogProps {
  customerId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CreateCustomerDocumentDialog({ 
  customerId, 
  onSuccess,
  trigger 
}: CreateCustomerDocumentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const createDocument = useCreateCustomerDocument();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.type) {
      toast.error("יש למלא את כל השדות הנדרשים");
      return;
    }

    try {
      await createDocument.mutateAsync({
        customerId,
        title: formData.title.trim(),
        type: formData.type,
        amount: parseFloat(formData.amount) || undefined,
        date: formData.date,
        notes: formData.notes.trim() || undefined
      });
      
      setIsOpen(false);
      onSuccess?.();
      setFormData({
        title: "",
        type: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        notes: ""
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            יצור מסמך חדש
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            יצירת מסמך חדש ללקוח
          </DialogTitle>
          <DialogDescription>
            צור מסמך דיגיטלי חדש עבור הלקוח
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת המסמך</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="הזן כותרת למסמך"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">סוג המסמך</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, type: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג מסמך" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">חשבונית</SelectItem>
                <SelectItem value="contract">הסכם</SelectItem>
                <SelectItem value="receipt">קבלה</SelectItem>
                <SelectItem value="quote">הצעת מחיר</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">סכום (₪)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">תאריך</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הוסף הערות נוספות..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={createDocument.isPending} className="flex-1">
              {createDocument.isPending ? "יוצר..." : "צור מסמך"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}