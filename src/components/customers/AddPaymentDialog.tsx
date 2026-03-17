import { useState } from "react";
import { Plus, CreditCard, Banknote, Building2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddCustomerPayment } from "@/hooks/customers/use-customer-payments";
import { useCustomerVehiclePurchases } from "@/hooks/customers";
import type { CustomerVehiclePurchase } from "@/types/customer";

interface AddPaymentDialogProps {
  customerId: string;
  preselectedPurchaseId?: string;
  trigger?: React.ReactNode;
}

const paymentMethods = [
  { value: 'cash', label: 'מזומן', icon: Banknote },
  { value: 'credit', label: 'אשראי', icon: CreditCard },
  { value: 'transfer', label: 'העברה בנקאית', icon: Building2 },
  { value: 'check', label: 'צ\'ק', icon: FileText },
] as const;

export function AddPaymentDialog({ customerId, preselectedPurchaseId, trigger }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'transfer' | 'check'>('cash');
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseId, setPurchaseId] = useState(preselectedPurchaseId || "");

  const addPayment = useAddCustomerPayment();
  const { data: purchases } = useCustomerVehiclePurchases(customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await addPayment.mutateAsync({
        customerId,
        purchaseId: purchaseId || undefined,
        amount: parseFloat(amount),
        paymentDate,
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setAmount("");
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
      setReference("");
      setNotes("");
      setPurchaseId(preselectedPurchaseId || "");
      setOpen(false);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const formatPurchaseLabel = (purchase: CustomerVehiclePurchase) => {
    const car = purchase.car;
    if (!car) return `עסקה ${purchase.id.slice(0, 8)}`;
    return `${car.make} ${car.model} ${car.year} - ₪${(purchase.purchase_price || 0).toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 ml-2" />
            הוסף תשלום
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">הוספת תשלום</DialogTitle>
          <DialogDescription>
            הזן את פרטי התשלום שהתקבל מהלקוח
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">סכום התשלום (₪) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="הזן סכום"
              min="0"
              step="0.01"
              required
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date">תאריך תשלום</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>אמצעי תשלום</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.value}
                    type="button"
                    variant={paymentMethod === method.value ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <Icon className="h-4 w-4 ml-2" />
                    {method.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">מספר אסמכתא</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="מספר צ'ק / אישור עסקה"
            />
          </div>

          {purchases && purchases.length > 0 && !preselectedPurchaseId && (
            <div className="space-y-2">
              <Label>קישור לעסקה (אופציונלי)</Label>
              <Select value={purchaseId} onValueChange={setPurchaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עסקה לקישור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ללא קישור לעסקה</SelectItem>
                  {purchases.map((purchase) => (
                    <SelectItem key={purchase.id} value={purchase.id}>
                      {formatPurchaseLabel(purchase)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות נוספות..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={addPayment.isPending || !amount}
            >
              {addPayment.isPending ? 'שומר...' : 'שמור תשלום'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
