import { useState } from "react";
import { Edit, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Customer } from "@/types/customer";
import { useUpdateCustomer } from "@/hooks/customers";

interface EditCustomerDialogProps {
  customer: Customer;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditCustomerDialog({ 
  customer,
  onSuccess,
  trigger 
}: EditCustomerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateCustomer = useUpdateCustomer();
  
  const [formData, setFormData] = useState({
    full_name: customer.full_name,
    id_number: customer.id_number || "",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
    city: customer.city || "",
    country: customer.country || "ישראל",
    fax: customer.fax || "",
    source: customer.source || "ידני",
    customer_type: customer.customer_type,
    status: customer.status,
    credit_amount: customer.credit_amount.toString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCustomer.mutateAsync({
        customerId: customer.id,
        customerData: {
          ...formData,
          credit_amount: parseFloat(formData.credit_amount) || 0
        }
      });
      
      toast.success("פרטי הלקוח עודכנו בהצלחה");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("שגיאה בעדכון פרטי הלקוח");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
            <Edit className="h-5 w-5 ml-2" />
            <span className="text-lg font-medium">ערוך פרטים</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            עריכת פרטי לקוח
          </DialogTitle>
          <DialogDescription>
            ערוך את פרטי הלקוח {customer.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">מספר זהות</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">עיר</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">מדינה</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">פקס</Label>
              <Input
                id="fax"
                value={formData.fax}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_type">סוג לקוח</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, customer_type: value as 'private' | 'business' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">פרטי</SelectItem>
                  <SelectItem value="business">עסקי</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">מקור הליד</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit_amount">יתרת קרדיט (₪)</Label>
              <Input
                id="credit_amount"
                type="number"
                value={formData.credit_amount}
                onChange={(e) => setFormData({ ...formData, credit_amount: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updateCustomer.isPending} className="flex-1">
              {updateCustomer.isPending ? "שומר..." : "שמור שינויים"}
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