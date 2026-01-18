import { Coins, TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCustomerBalance } from "@/hooks/customers/use-customer-payments";
import { AddPaymentDialog } from "./AddPaymentDialog";

interface CustomerCreditProps {
  customerId: string;
}

export function CustomerCredit({ customerId }: CustomerCreditProps) {
  const { data: balance, isLoading } = useCustomerBalance(customerId);

  if (isLoading) {
    return (
      <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-emerald-50/95 backdrop-blur-md">
        <CardContent className="py-12 text-center text-muted-foreground">
          טוען נתוני יתרה...
        </CardContent>
      </Card>
    );
  }

  const { totalPurchases = 0, totalPayments = 0, outstandingBalance = 0, paymentPercentage = 0 } = balance || {};
  const hasDebt = outstandingBalance > 0;
  const isFullyPaid = totalPurchases > 0 && outstandingBalance <= 0;

  return (
    <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-emerald-50/95 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-4 rounded-2xl">
                <Wallet className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 mb-1">
                מצב תשלומים
              </CardTitle>
              <CardDescription className="text-lg text-slate-600">
                סיכום יתרות ותשלומים
              </CardDescription>
            </div>
          </div>
          {hasDebt && (
            <AddPaymentDialog 
              customerId={customerId}
              trigger={
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">הוסף תשלום</span>
                </button>
              }
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Total Purchases */}
          <div className="bg-slate-50 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">סה"כ עסקאות</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              ₪{totalPurchases.toLocaleString()}
            </p>
          </div>

          {/* Total Payments */}
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">סה"כ תשלומים</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ₪{totalPayments.toLocaleString()}
            </p>
          </div>

          {/* Outstanding Balance */}
          <div className={`rounded-2xl p-4 text-center ${hasDebt ? 'bg-amber-50' : 'bg-green-50'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className={`h-5 w-5 ${hasDebt ? 'text-amber-500' : 'text-green-500'}`} />
              <span className={`text-sm font-medium ${hasDebt ? 'text-amber-700' : 'text-green-700'}`}>
                יתרת חוב
              </span>
            </div>
            <p className={`text-2xl font-bold ${hasDebt ? 'text-amber-600' : 'text-green-600'}`}>
              ₪{Math.abs(outstandingBalance).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {totalPurchases > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">התקדמות תשלום</span>
              <span className={`font-bold ${isFullyPaid ? 'text-green-600' : 'text-amber-600'}`}>
                {Math.round(paymentPercentage)}%
              </span>
            </div>
            <Progress 
              value={paymentPercentage} 
              className="h-3 rounded-full"
            />
            <p className="text-center text-sm text-muted-foreground">
              {isFullyPaid ? (
                <span className="text-green-600 font-medium">✓ שולם במלואו</span>
              ) : hasDebt ? (
                `נותרו ₪${outstandingBalance.toLocaleString()} לתשלום`
              ) : (
                'אין עסקאות פתוחות'
              )}
            </p>
          </div>
        )}

        {totalPurchases === 0 && (
          <div className="text-center py-6 bg-slate-50 rounded-2xl">
            <Coins className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-muted-foreground">
              אין עסקאות רשומות עדיין
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
