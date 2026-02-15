import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface TranzilaPaymentIframeProps {
  supplier: string;
  thtk: string;
  sum: number;
  recurSum: number;
  recurTransaction: string; // "4_approved" for monthly, "7_approved" for yearly
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
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(true);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tranzila-webhook`;

  // Build product data for invoice
  const purchaseData = JSON.stringify([{
    product_name: productName,
    product_quantity: 1,
    product_price: sum,
  }]);

  // Calculate recur start date (next month/year from now)
  const recurStartDate = (() => {
    const d = new Date();
    if (billingCycle === 'yearly') {
      d.setFullYear(d.getFullYear() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split('T')[0]; // yyyy-mm-dd
  })();

  useEffect(() => {
    // Auto-submit the form to load the iFrame
    if (formRef.current) {
      formRef.current.submit();
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  const iframeAction = `https://direct.tranzila.com/${supplier}/iframenew.php`;

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

      {/* Hidden form that auto-submits to the iframe */}
      <form
        ref={formRef}
        action={iframeAction}
        method="POST"
        target="tranzila-iframe"
        style={{ display: 'none' }}
      >
        {/* Core transaction params */}
        <input type="hidden" name="sum" value={sum} />
        <input type="hidden" name="currency" value="1" />
        <input type="hidden" name="cred_type" value="1" />
        <input type="hidden" name="tranmode" value="A" />
        <input type="hidden" name="new_process" value="1" />
        <input type="hidden" name="thtk" value={thtk} />

        {/* Recurring params */}
        <input type="hidden" name="recur_transaction" value={recurTransaction} />
        <input type="hidden" name="recur_sum" value={recurSum} />
        <input type="hidden" name="recur_start_date" value={recurStartDate} />

        {/* Customer info */}
        <input type="hidden" name="contact" value={customerInfo.contact} />
        <input type="hidden" name="email" value={customerInfo.email} />
        <input type="hidden" name="phone" value={customerInfo.phone} />
        {customerInfo.company && <input type="hidden" name="company" value={customerInfo.company} />}
        {customerInfo.address && <input type="hidden" name="address" value={customerInfo.address} />}
        {customerInfo.city && <input type="hidden" name="city" value={customerInfo.city} />}

        {/* Custom fields for webhook */}
        <input type="hidden" name="planId" value={planId} />
        <input type="hidden" name="billingCycle" value={billingCycle} />
        {userId && <input type="hidden" name="userId" value={userId} />}
        {isNewUser && <input type="hidden" name="isNewUser" value="true" />}

        {/* Webhook notification URL */}
        <input type="hidden" name="notify_url" value={webhookUrl} />

        {/* Success/Error redirect URLs */}
        <input type="hidden" name="success_url_address" value={`${window.location.origin}/subscription/payment-success?plan=${planId}&cycle=${billingCycle}`} />
        <input type="hidden" name="fail_url_address" value={`${window.location.origin}/subscription/payment-error?plan=${planId}`} />

        {/* Display settings */}
        <input type="hidden" name="lang" value="il" />
        <input type="hidden" name="nologo" value="1" />
        <input type="hidden" name="buttonLabel" value="שלם" />
        <input type="hidden" name="trBgColor" value="FFFFFF" />
        <input type="hidden" name="trTextColor" value="1a1a1a" />
        <input type="hidden" name="trButtonColor" value="2563eb" />

        {/* Invoice product details */}
        <input type="hidden" name="u71" value="1" />
        <input type="hidden" name="json_purchase_data" value={encodeURIComponent(purchaseData)} />
      </form>

      <iframe
        name="tranzila-iframe"
        id="tranzila-iframe"
        className="w-full border-0 rounded-lg"
        style={{ height: '500px', minHeight: '500px' }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
