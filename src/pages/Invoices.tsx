import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  currency: string;
  status: string;
  pdf_url: string;
  billing_details: any;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "יש להתחבר כדי לצפות בחשבוניות",
        });
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת חשבוניות",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    window.open(invoice.pdf_url, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">החשבוניות שלי</h1>
          <p className="text-muted-foreground mt-2">
            צפה והורד את כל החשבוניות שלך
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              אין חשבוניות עדיין
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              כאשר תבצע תשלום, החשבוניות שלך יופיעו כאן
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        חשבונית {invoice.invoice_number}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {invoice.billing_details?.companyName || invoice.billing_details?.fullName}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-brand-primary">
                      ₪{invoice.amount.toFixed(2)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                      invoice.status === 'paid' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {invoice.status === 'paid' ? 'שולם' : 'ממתין'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy', { locale: he })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>{invoice.currency}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(invoice)}
                    className="bg-brand-primary hover:bg-brand-primary/90"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    הורד חשבונית
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
