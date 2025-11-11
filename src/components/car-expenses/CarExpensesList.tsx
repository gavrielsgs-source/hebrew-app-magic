import { useGetCarExpenses, useDeleteCarExpense } from "@/hooks/car-expenses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Wrench, Droplet, Palette, Package, Truck, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { EXPENSE_TYPES } from "@/types/car-expense";

interface CarExpensesListProps {
  carId: string;
}

const getExpenseIcon = (type: string) => {
  switch (type) {
    case 'repair': return <Wrench className="h-4 w-4" />;
    case 'cleaning': return <Droplet className="h-4 w-4" />;
    case 'paint': return <Palette className="h-4 w-4" />;
    case 'parts': return <Package className="h-4 w-4" />;
    case 'transport': return <Truck className="h-4 w-4" />;
    default: return <MoreHorizontal className="h-4 w-4" />;
  }
};

export const CarExpensesList = ({ carId }: CarExpensesListProps) => {
  const { data, isLoading } = useGetCarExpenses(carId);
  const deleteExpense = useDeleteCarExpense();

  if (isLoading) {
    return <div className="text-center py-8">טוען הוצאות...</div>;
  }

  if (!data || data.expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        לא נמצאו הוצאות עבור רכב זה
      </div>
    );
  }

  const handleDelete = async (expenseId: string, documentUrl?: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      await deleteExpense.mutateAsync({ id: expenseId, carId, documentUrl });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">סה״כ הוצאות</p>
              <p className="text-2xl font-bold">₪{data.summary.total.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">מספר הוצאות</p>
              <p className="text-2xl font-bold">{data.summary.count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {data.expenses.map((expense) => {
          const expenseType = EXPENSE_TYPES.find(t => t.value === expense.expense_type);
          return (
            <Card key={expense.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getExpenseIcon(expense.expense_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{expenseType?.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(expense.expense_date), 'd בMMMM yyyy', { locale: he })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{expense.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">
                          ₪{expense.total_with_vat.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({expense.include_vat ? 'כולל מע״מ' : 'ללא מע״מ'})
                        </span>
                        {expense.invoice_number && (
                          <span className="text-xs text-muted-foreground">
                            חשבונית: {expense.invoice_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expense.document_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(expense.document_url, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense.id, expense.document_url)}
                      disabled={deleteExpense.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
