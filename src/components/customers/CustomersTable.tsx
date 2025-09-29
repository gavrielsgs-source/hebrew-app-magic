import { useState } from "react";
import { Eye, Edit2, Trash2, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import type { Customer } from "@/types/customer";

interface CustomersTableProps {
  customers: Customer[];
  onDeleteCustomer?: (customerId: string) => void;
}

export function CustomersTable({ customers, onDeleteCustomer }: CustomersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (customerId: string) => {
    setDeletingId(customerId);
    try {
      await onDeleteCustomer?.(customerId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (customers.length === 0) {
    return (
      <Card className="p-12 text-center rounded-xl shadow-sm border">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">אין לקוחות במערכת</p>
          <p className="text-sm">התחל בהוספת הלקוח הראשון שלך</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-right font-semibold">מספר לקוח</TableHead>
            <TableHead className="text-right font-semibold">שם מלא</TableHead>
            <TableHead className="text-right font-semibold">טלפון</TableHead>
            <TableHead className="text-right font-semibold">אימייל</TableHead>
            <TableHead className="text-right font-semibold">סוג לקוח</TableHead>
            <TableHead className="text-right font-semibold">קרדיט</TableHead>
            <TableHead className="text-center font-semibold">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => (
            <TableRow 
              key={customer.id} 
              className={`transition-colors hover:bg-muted/30 ${
                index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
              }`}
            >
              <TableCell className="text-right">
                <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded-md">
                  #{customer.customer_number}
                </span>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="font-medium">{customer.full_name}</div>
              </TableCell>
              
              <TableCell className="text-right">
                {customer.phone ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-sm">{customer.phone}</span>
                    <Phone className="h-3 w-3 text-muted-foreground" />
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">לא צוין</span>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                {customer.email ? (
                  <span className="text-sm">{customer.email}</span>
                ) : (
                  <span className="text-muted-foreground text-sm">לא צוין</span>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  customer.customer_type === 'private' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {customer.customer_type === 'private' ? 'פרטי' : 'עסקי'}
                </span>
              </TableCell>
              
              <TableCell className="text-right">
                {customer.credit_amount > 0 ? (
                  <span className="font-semibold text-green-600">
                    {formatCurrency(customer.credit_amount)}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">ללא קרדיט</span>
                )}
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                  >
                    <Link to={`/customers/${customer.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log('Edit customer:', customer.id);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        disabled={deletingId === customer.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>מחיקת לקוח</AlertDialogTitle>
                        <AlertDialogDescription>
                          האם אתה בטוח שברצונך למחוק את הלקוח {customer.full_name}?
                          פעולה זו לא ניתנת לביטול.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(customer.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          מחק
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}