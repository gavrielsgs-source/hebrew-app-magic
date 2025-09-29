import { useState } from "react";
import { CreditCard, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCustomer } from "@/hooks/customers";
import type { Customer } from "@/types/customer";

interface CustomerCreditProps {
  customer: Customer;
}

export function CustomerCredit({ customer }: CustomerCreditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [creditAmount, setCreditAmount] = useState(customer.credit_amount.toString());
  
  const updateCustomer = useUpdateCustomer();

  const handleSave = async () => {
    const amount = parseFloat(creditAmount) || 0;
    
    try {
      await updateCustomer.mutateAsync({
        customerId: customer.id,
        customerData: { credit_amount: amount }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating credit:', error);
      // Reset on error
      setCreditAmount(customer.credit_amount.toString());
    }
  };

  const handleCancel = () => {
    setCreditAmount(customer.credit_amount.toString());
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              קרדיט לקוח
            </CardTitle>
            <CardDescription>
              ניהול יתרת קרדיט ללקוח
            </CardDescription>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 ml-2" />
              ערוך
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credit-amount">סכום קרדיט (₪)</Label>
              <Input
                id="credit-amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={updateCustomer.isPending}
              >
                <Save className="h-4 w-4 ml-2" />
                {updateCustomer.isPending ? 'שומר...' : 'שמור'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={updateCustomer.isPending}
              >
                <X className="h-4 w-4 ml-2" />
                ביטול
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              הסכום שמוזן כאן הוא לצרכי מעקב בלבד
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl font-bold text-primary mb-2">
              ₪{customer.credit_amount.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              יתרת קרדיט נוכחית
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              הסכום מוצג לצרכי מעקב בלבד
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}