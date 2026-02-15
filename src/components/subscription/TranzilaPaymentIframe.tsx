import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

interface TranzilaPaymentIframeProps {
  supplier: string;
  thtk: string;
  sum: number;
  recurSum: number;
  recurTransaction: string;
  customerInfo: {
    contact: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    city?: string;
  };
  planId: string;
  billingCycle: string;
  userId?: string;
  isNewUser?: boolean;
  productName: string;
}

export function TranzilaPaymentIframe({
  supplier,
  thtk,
  sum,
  recurSum,
  recurTransaction,
  customerInfo,
  planId,
  billingCycle,
  userId,
  isNewUser,
  productName,
}: TranzilaPaymentIframeProps) {
  const [loading, setLoading] = useState(true);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tranzila-webhook`;

  const recurStartDate = useMemo(() => {
    const d = new Date();
    if (billingCycle === 'yearly') {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split('T')[0];
  }, [billingCycle]);

  const purchaseData = JSON.stringify([{
    product_name: productName,
    product_quantity: 1,
    product_price: sum,
  }]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    // Core transaction params
    params.set('sum', String(sum));
    params.set('currency', '1');
    params.set('cred_type', '1');
    params.set('tranmode', 'A');
    params.set('new_process', '1');
    params.set('thtk', thtk);

    // Recurring params
    params.set('recur_transaction', recurTransaction);
    params.set('recur_start_date', recurStartDate);

    // Customer info
    params.set('contact', customerInfo.contact);
    params.set('email', customerInfo.email);
    params.set('phone', customerInfo.phone);
    if (customerInfo.company) params.set('company', customerInfo.company);
    if (customerInfo.address) params.set('address', customerInfo.address);
    if (customerInfo.city) params.set('city', customerInfo.city);

    // Custom fields for webhook
    params.set('planId', planId);
    params.set('billingCycle', billingCycle);
    if (userId) params.set('userId', userId);
    if (isNewUser) params.set('isNewUser', 'true');

    // Webhook notification URL
    params.set('notify_url', webhookUrl);

    // Success/Error redirect URLs
    params.set('success_url_address', `${window.location.origin}/subscription/payment-success?plan=${planId}&cycle=${billingCycle}`);
    params.set('fail_url_address', `${window.location.origin}/subscription/payment-error?plan=${planId}`);

    // Display settings
    params.set('lang', 'il');
    params.set('nologo', '1');
    params.set('buttonLabel', 'שלם');
    params.set('trBgColor', 'FFFFFF');
    params.set('trTextColor', '1a1a1a');
    params.set('trButtonColor', '2563eb');

    // Invoice product details
    params.set('u71', '1');
    params.set('json_purchase_data', purchaseData);

    return `https://direct.tranzila.com/${supplier}/iframenew.php?${params.toString()}`;
  }, [supplier, thtk, sum, recurSum, recurTransaction, recurStartDate, customerInfo, planId, billingCycle, userId, isNewUser, webhookUrl, purchaseData]);

  return (
    <div className="relative w-full" style={{ minHeight: '500px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">טוען טופס תשלום...</span>
          </div>
        </div>
      )}

      <iframe
        src={iframeSrc}
        name="tranzila-iframe"
        id="tranzila-iframe"
        className="w-full border-0 rounded-lg"
        style={{ height: '500px', minHeight: '500px' }}
        onLoad={() => setLoading(false)}
        allow="payment"
      />
    </div>
  );
}
