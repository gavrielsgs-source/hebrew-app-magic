import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Trash2, CreditCard, Banknote, Building2, FileText, Receipt, Car } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useCustomerPayments, useDeleteCustomerPayment } from "@/hooks/customers/use-customer-payments";
import { AddPaymentDialog } from "./AddPaymentDialog";
import type { CustomerPayment } from "@/types/customer";

interface CustomerPaymentsHistoryProps {
  customerId: string;
}

const paymentMethodLabels: Record<string, { label: string; icon: React.ElementType }> = {
  cash: { label: 'מזומן', icon: Banknote },
  credit: { label: 'אשראי', icon: CreditCard },
  transfer: { label: 'העברה', icon: Building2 },
  check: { label: 'צ\'ק', icon: FileText },
};

export function CustomerPaymentsHistory({ customerId }: CustomerPaymentsHistoryProps) {
  const { data: payments, isLoading } = useCustomerPayments(customerId);
  const deletePayment = useDeleteCustomerPayment();

  const handleDelete = async (paymentId: string) => {
    await deletePayment.mutateAsync({ paymentId, customerId });
  };

  const getMethodInfo = (method: string) => {
    return paymentMethodLabels[method] || { label: method, icon: Receipt };
  };

  return (
    <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl blur-sm"></div>
              <div className="relative bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 rounded-2xl">
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 mb-1">
                היסטוריית תשלומים
              </CardTitle>
              <CardDescription className="text-lg text-slate-600">
                {payments?.length || 0} תשלומים נרשמו
              </CardDescription>
            </div>
          </div>
          <AddPaymentDialog customerId={customerId} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">טוען...</div>
        ) : !payments || payments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Receipt className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-muted-foreground">
              אין תשלומים רשומים
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              הוסף תשלום ראשון כדי להתחיל לעקוב
            </p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right font-semibold">תאריך</TableHead>
                  <TableHead className="text-right font-semibold">סכום</TableHead>
                  <TableHead className="text-right font-semibold">אמצעי תשלום</TableHead>
                  <TableHead className="text-right font-semibold">אסמכתא</TableHead>
                  <TableHead className="text-right font-semibold">קישור לעסקה</TableHead>
                  <TableHead className="text-right font-semibold">הערות</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const methodInfo = getMethodInfo(payment.payment_method);
                  const MethodIcon = methodInfo.icon;
                  
                  return (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: he })}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-600">
                          ₪{payment.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <MethodIcon className="h-3 w-3" />
                          {methodInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.reference || '-'}
                      </TableCell>
                      <TableCell>
                        {payment.purchase?.car ? (
                          <Badge variant="outline" className="gap-1">
                            <Car className="h-3 w-3" />
                            {payment.purchase.car.make} {payment.purchase.car.model}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {payment.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>מחיקת תשלום</AlertDialogTitle>
                              <AlertDialogDescription>
                                האם אתה בטוח שברצונך למחוק תשלום זה? פעולה זו לא ניתנת לביטול.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row-reverse gap-2">
                              <AlertDialogCancel>ביטול</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(payment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                מחק
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
