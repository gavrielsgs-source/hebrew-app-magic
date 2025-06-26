
import { useSubscription } from '@/contexts/subscription-context';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrialBanner() {
  const { subscription, daysLeftInTrial, isTrialExpired } = useSubscription();
  const navigate = useNavigate();

  if (!subscription.isTrialActive && !isTrialExpired) {
    return null;
  }

  if (isTrialExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-red-400 ml-2" />
            <div>
              <p className="text-sm font-medium text-red-800">
                תקופת הניסיון שלך הסתיימה
              </p>
              <p className="text-sm text-red-700">
                שדרג עכשיו כדי להמשיך להשתמש במערכת
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/subscription/upgrade')}
            className="bg-red-600 hover:bg-red-700"
          >
            שדרג עכשיו
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-400 ml-2" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              נשארו לך {daysLeftInTrial} ימים בניסיון החינם
            </p>
            <p className="text-sm text-blue-700">
              שדרג עכשיו כדי להמשיך ללא הפרעה
            </p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/subscription/upgrade')}
          variant="outline"
          className="border-blue-400 text-blue-700 hover:bg-blue-100"
        >
          שדרג עכשיו
        </Button>
      </div>
    </div>
  );
}
