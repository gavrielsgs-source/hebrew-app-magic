import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, Calendar, ArrowLeft, Receipt, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/subscription-context';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

const MAX_ATTEMPTS = 10;
const INTERVAL_MS = 2000;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);
  
  const planId = searchParams.get('plan');
  const billingCycle = searchParams.get('cycle') || 'monthly';
  const confirmationCode = searchParams.get('ConfirmationCode');
  const transactionId = searchParams.get('index') || searchParams.get('transactionId');

  useEffect(() => {
    cancelledRef.current = false;
    attemptsRef.current = 0;

    const pollSubscription = async () => {
      if (cancelledRef.current) return;

      attemptsRef.current += 1;
      setAttempt(attemptsRef.current);

      try {
        // Query Supabase directly to avoid stale React closure issue
        let subscriptionData = null;

        if (user) {
          // Try company owner first
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .single();

          if (companyData) {
            const { data } = await supabase
              .from('subscriptions')
              .select('subscription_status, subscription_tier')
              .eq('company_id', companyData.id)
              .single();
            subscriptionData = data;
          }

          if (!subscriptionData) {
            const { data } = await supabase
              .from('subscriptions')
              .select('subscription_status, subscription_tier')
              .eq('user_id', user.id)
              .single();
            subscriptionData = data;
          }
        }

        const isActive = subscriptionData?.subscription_status === 'active';
        const tierMatches = !planId || subscriptionData?.subscription_tier === planId;

        if (isActive && tierMatches) {
          if (cancelledRef.current) return;
          await refreshSubscription();
          setLoading(false);
          toast.success('המנוי שודרג בהצלחה!');
          return;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (cancelledRef.current) return;
        await refreshSubscription();
        setLoading(false);
        toast.success('התשלום התקבל! המנוי יתעדכן בקרוב.');
        return;
      }

      setTimeout(pollSubscription, INTERVAL_MS);
    };

    pollSubscription();

    return () => {
      cancelledRef.current = true;
    };
  }, []);
  
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

  const progressValue = Math.min((attempt / MAX_ATTEMPTS) * 100, 95);
  
  return (
    <div className={`container mx-auto py-16 px-4 ${isMobile ? 'py-8 px-3 max-w-sm' : 'max-w-lg'}`}>
      <Card className="overflow-hidden border-green-200 dark:border-green-800">
        {/* Success Header */}
        <div className="bg-green-50 dark:bg-green-950/30 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-4">
              {loading ? (
                <Loader2 className={`text-green-600 dark:text-green-400 animate-spin ${isMobile ? 'h-10 w-10' : 'h-14 w-14'}`} />
              ) : (
                <CheckCircle className={`text-green-600 dark:text-green-400 ${isMobile ? 'h-10 w-10' : 'h-14 w-14'}`} />
              )}
            </div>
          </div>
          <h1 className={`font-bold text-green-800 dark:text-green-300 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {loading ? 'מאמת תשלום...' : 'התשלום התקבל בהצלחה!'}
          </h1>
          <p className="text-green-700 dark:text-green-400 mt-1 text-sm">
            {loading ? 'מחכה לאישור מהשרת, אנא המתן' : `המנוי שלך שודרג לחבילת ${getPlanName()}`}
          </p>

          {loading && (
            <div className="mt-4 space-y-1">
              <Progress value={progressValue} className="h-1.5 bg-green-200 dark:bg-green-800" />
              <p className="text-xs text-green-600 dark:text-green-500">
                ניסיון {attempt} מתוך {MAX_ATTEMPTS}
              </p>
            </div>
          )}
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
              <span className="font-medium text-sm">₪{getPlanPrice()}/חודש</span>
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
              {loading ? (
                <><Loader2 className="h-4 w-4 ml-2 animate-spin" />מאמת תשלום...</>
              ) : 'לדף ניהול המנוי'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
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
