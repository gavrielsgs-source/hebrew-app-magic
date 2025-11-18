import { useState } from "react";
import { Eye, Edit2, Trash2, Phone, Users, MessageCircle } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { WhatsAppCustomerDialog } from "./WhatsAppCustomerDialog";
import type { Customer } from "@/types/customer";

interface CustomersTableProps {
  customers: Customer[];
  onDeleteCustomer?: (customerId: string) => void;
}

export function CustomersTable({ customers, onDeleteCustomer }: CustomersTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

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
      <Card className="p-16 text-center rounded-2xl shadow-lg border-0 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">ברוכים הבאים לניהול הלקוחות</h3>
            <p className="text-muted-foreground text-lg">התחל לבנות את בסיס הלקוחות שלך עכשיו</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Stats Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">סהכ לקוחות במערכת</h3>
              <p className="text-sm text-muted-foreground">רשומים ופעילים</p>
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-primary">{customers.length}</div>
            <div className="text-xs text-muted-foreground">לקוחות</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card className="rounded-2xl shadow-lg border-0 overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <div className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-4 border-b border-border/50">
          <h4 className="font-semibold text-foreground text-lg">רשימת הלקוחות</h4>
          <p className="text-sm text-muted-foreground">כל הפרטים וכלי הניהול במקום אחד</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 hover:from-muted/50 hover:via-muted/40 hover:to-muted/50 border-b border-border/30">
              <TableHead className="text-right font-bold text-foreground py-4 px-6 w-[120px]">
                <div className="text-right pr-3">
                  <span className="text-base">מספר לקוח</span>
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-foreground py-4 px-6 w-[200px]">
                <div className="text-right">
                  <span className="text-base">שם מלא</span>
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-foreground py-4 px-6 w-[180px]">
                <div className="text-right pr-4">
                  <span className="text-base">טלפון</span>
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-foreground py-4 px-6 w-[220px]">
                <div className="text-right pr-3">
                  <span className="text-base">אימייל</span>
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-foreground py-4 px-6 w-[140px]">
                <div className="text-right pr-4">
                  <span className="text-base">סוג לקוח</span>
                </div>
              </TableHead>
              <TableHead className="text-center font-bold text-foreground py-4 px-6 w-[380px]">
                <div className="text-center">
                  <span className="text-base">פעולות</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow 
                key={customer.id} 
                className={`group transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:via-background hover:to-primary/5 hover:shadow-md ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                } border-b border-border/20 last:border-b-0`}
              >
                <TableCell className="py-4 px-6 text-right">
                  <div className="text-right pr-3">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/10 px-3 py-2 rounded-xl border border-primary/20 inline-block">
                      <span className="font-bold text-primary text-sm">#{customer.customer_number}</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-4 px-6 text-right">
                  <div className="text-right">
                    <Link to={`/customers/${customer.id}`} className="block hover:text-primary transition-colors">
                      <div className="space-y-1 text-right">
                        <div className="font-bold text-foreground text-base hover:text-primary transition-colors cursor-pointer">
                          {customer.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">לקוח רשום</div>
                      </div>
                    </Link>
                  </div>
                </TableCell>
                
                <TableCell className="py-4 px-6 text-right">
                  <div className="text-right pr-4">
                    {customer.phone ? (
                      <div className="bg-muted/30 p-3 rounded-lg inline-flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">{customer.phone}</span>
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm bg-muted/20 px-3 py-2 rounded-lg inline-block">
                        לא הוזן מספר
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4 px-6 text-right">
                  <div className="text-right pr-3">
                    {customer.email ? (
                      <div className="bg-muted/30 p-3 rounded-lg inline-block">
                        <span className="text-base font-semibold text-foreground max-w-[180px] truncate block text-right" title={customer.email}>
                          {customer.email}
                        </span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm bg-muted/20 px-3 py-2 rounded-lg inline-block">
                        לא הוזן אימייל
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="py-4 px-6 text-right">
                  <div className="text-right pr-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                      customer.customer_type === 'private' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' 
                        : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200'
                    }`}>
                      <span>{customer.customer_type === 'private' ? 'לקוח פרטי' : 'לקוח עסקי'}</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-11 px-4 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/20 hover:text-primary rounded-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 shadow-sm hover:shadow-md"
                    >
                      <Link to={`/customers/${customer.id}`}>
                        <Eye className="h-4 w-4 ml-2" />
                        <span className="font-medium">צפייה</span>
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 px-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-600 rounded-xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 shadow-sm hover:shadow-md"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsWhatsappOpen(true);
                      }}
                      disabled={!customer.phone}
                    >
                      <MessageCircle className="h-4 w-4 ml-2" />
                      <span className="font-medium">וואטסאפ</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 px-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 rounded-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 shadow-sm hover:shadow-md"
                      onClick={() => {
                        console.log('Edit customer:', customer.id);
                      }}
                    >
                      <Edit2 className="h-4 w-4 ml-2" />
                      <span className="font-medium">עריכה</span>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-11 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 rounded-xl transition-all duration-300 border-2 border-red-200 hover:border-red-400 shadow-sm hover:shadow-md"
                          disabled={deletingId === customer.id}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          <span className="font-medium">מחיקה</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl">מחיקת לקוח</AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            האם אתה בטוח שברצונך למחוק את <strong>{customer.full_name}</strong>?
                            <br />
                            <span className="text-red-600 font-medium">פעולה זו לא ניתנת לביטול והנתונים יאבדו לצמיתות.</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3">
                          <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(customer.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl"
                          >
                            מחק לקוח
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
        </div>
      </Card>
      
      {/* WhatsApp Dialog */}
      <Dialog open={isWhatsappOpen} onOpenChange={setIsWhatsappOpen}>
        <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>שליחת הודעה בוואטסאפ ללקוח</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <WhatsAppCustomerDialog 
              customer={selectedCustomer} 
              onClose={() => setIsWhatsappOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}