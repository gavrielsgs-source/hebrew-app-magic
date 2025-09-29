import { useState } from "react";
import { CreditCard, Edit, Save, X, Coins, TrendingUp } from "lucide-react";
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
    <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-emerald-50/95 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-4 rounded-2xl">
                <Coins className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
                💳 קרדיט לקוח
              </CardTitle>
              <CardDescription className="text-xl text-slate-600">
                ניהול יתרת קרדיט ומעקב פיננסי
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setIsEditing(true)}
              className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300"
            >
              <Edit className="h-5 w-5 ml-2" />
              <span className="text-lg font-medium">ערוך</span>
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
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-lg opacity-20"></div>
              <div className="relative text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                ₪{customer.credit_amount.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              <p className="text-xl font-semibold text-slate-700">
                יתרת קרדיט נוכחית
              </p>
            </div>
            <p className="text-lg text-muted-foreground bg-slate-50 rounded-2xl px-6 py-3 inline-block">
              הסכום מוצג לצרכי מעקב בלבד
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}