
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/subscription-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  
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
    <div className="container mx-auto max-w-md py-16 px-4">
      <div className="bg-card border rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">התשלום התקבל בהצלחה!</h1>
        
        <p className="text-muted-foreground mb-6">
          המנוי שלך שודרג לחבילת {getPlanName()}.
          {transactionId && (
            <span className="block mt-2 text-sm">
              מספר עסקה: {transactionId}
            </span>
          )}
        </p>
        
        <div className="space-y-4">
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
            onClick={() => navigate('/')}
          >
            לדף הבית
          </Button>
        </div>
      </div>
    </div>
  );
}
