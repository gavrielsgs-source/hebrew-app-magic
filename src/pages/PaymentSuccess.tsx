import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, Calendar, ArrowLeft, Receipt } from 'lucide-react';
import { useSubscription } from '@/contexts/subscription-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const isMobile = useIsMobile();
  
  const planId = searchParams.get('plan');
  const billingCycle = searchParams.get('cycle') || 'monthly';
  const confirmationCode = searchParams.get('ConfirmationCode');
  const transactionId = searchParams.get('index') || searchParams.get('transactionId');
  
  useEffect(() => {
    const handleSuccess = async () => {
      try {
        setLoading(true);
        await refreshSubscription();
        toast.success('המנוי שודרג בהצלחה!');
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    handleSuccess();
  }, [refreshSubscription]);
  
  const getPlanName = () => {
    switch(planId) {
      case 'premium': return 'פרימיום';
      case 'business': return 'ביזנס';
      case 'enterprise': return 'אנטרפרייז';
      default: return 'חדש';
    }
  };

  const getPlanPrice = () => {
    const prices: Record<string, Record<string, number>> = {
      premium: { monthly: 199, yearly: 179 },
      business: { monthly: 399, yearly: 349 },
      enterprise: { monthly: 699, yearly: 619 },
    };
    return planId ? prices[planId]?.[billingCycle] || 0 : 0;
  };
  
  return (
    <div className={`container mx-auto py-16 px-4 ${isMobile ? 'py-8 px-3 max-w-sm' : 'max-w-lg'}`}>
      <Card className="overflow-hidden border-green-200 dark:border-green-800">
        {/* Success Header */}
        <div className="bg-green-50 dark:bg-green-950/30 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-4">
              <CheckCircle className={`text-green-600 dark:text-green-400 ${isMobile ? 'h-10 w-10' : 'h-14 w-14'}`} />
            </div>
          </div>
          <h1 className={`font-bold text-green-800 dark:text-green-300 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            התשלום התקבל בהצלחה!
          </h1>
          <p className="text-green-700 dark:text-green-400 mt-1 text-sm">
            המנוי שלך שודרג לחבילת {getPlanName()}
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">פרטי עסקה</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>חבילה</span>
              </div>
              <span className="font-medium text-sm">{getPlanName()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>מחזור חיוב</span>
              </div>
              <span className="font-medium text-sm">{billingCycle === 'yearly' ? 'שנתי' : 'חודשי'}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span>סכום</span>
              </div>
              <span className="font-medium text-sm">₪{getPlanPrice()}/{billingCycle === 'yearly' ? 'חודש' : 'חודש'}</span>
            </div>

            {(confirmationCode || transactionId) && (
              <>
                <Separator />
                {confirmationCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">אסמכתא</span>
                    <span className="font-mono text-xs">{confirmationCode}</span>
                  </div>
                )}
                {transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">מספר עסקה</span>
                    <span className="font-mono text-xs">{transactionId}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => navigate('/subscription')}
              disabled={loading}
            >
              לדף ניהול המנוי
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              לדף הראשי
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
