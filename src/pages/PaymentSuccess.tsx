
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/subscription-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const isMobile = useIsMobile();
  
  const planId = searchParams.get('plan');
  const transactionId = searchParams.get('transactionId');
  
  useEffect(() => {
    const updateSubscription = async () => {
      try {
        setLoading(true);
        
        if (!planId || !transactionId) {
          throw new Error('חסרים פרטי עסקה');
        }
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('משתמש לא מחובר');
        }
        
        // Update the user's subscription in the database
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_tier: planId,
            subscription_transaction_id: transactionId,
            subscription_updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
        
        // Refresh the subscription context
        await refreshSubscription();
        
        toast.success('המנוי שודרג בהצלחה!');
      } catch (error) {
        console.error('Error updating subscription:', error);
        toast.error('אירעה שגיאה בעדכון המנוי');
      } finally {
        setLoading(false);
      }
    };
    
    updateSubscription();
  }, [planId, transactionId, refreshSubscription]);
  
  const getPlanName = () => {
    switch(planId) {
      case 'premium': return 'פרימיום';
      case 'business': return 'ביזנס';
      case 'enterprise': return 'אנטרפרייז';
      default: return 'חדש';
    }
  };
  
  return (
    <div className={`container mx-auto py-16 px-4 ${
      isMobile ? 'py-8 px-2 max-w-sm' : 'max-w-md'
    }`}>
      <div className={`bg-card border rounded-lg text-center ${
        isMobile ? 'p-6' : 'p-8'
      }`}>
        <div className="flex justify-center mb-6">
          <CheckCircle className={`text-green-500 ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />
        </div>
        
        <h1 className={`font-bold mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>התשלום התקבל בהצלחה!</h1>
        
        <p className={`text-muted-foreground mb-6 ${isMobile ? 'text-sm' : ''}`}>
          המנוי שלך שודרג לחבילת {getPlanName()}.
          {transactionId && (
            <span className={`block mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              מספר עסקה: {transactionId}
            </span>
          )}
        </p>
        
        <div className="space-y-4">
          <Button 
            className={`w-full ${isMobile ? 'text-sm' : ''}`}
            onClick={() => navigate('/subscription')}
            disabled={loading}
          >
            לדף ניהול המנוי
          </Button>
          
          <Button 
            variant="outline" 
            className={`w-full ${isMobile ? 'text-sm' : ''}`}
            onClick={() => navigate('/')}
          >
            לדף הבית
          </Button>
        </div>
      </div>
    </div>
  );
}
