
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Crown, X } from 'lucide-react';
import { useSubscription } from '@/contexts/subscription-context';
import { useState } from 'react';

export function TrialBanner() {
  const { subscription, daysLeftInTrial, isTrialExpired } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  // Don't show banner if dismissed, if user has paid subscription, or if trial expired
  if (dismissed || !subscription.isTrialActive || isTrialExpired) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-4 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2F3C7E] to-[#4CAF50] rounded-xl flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
          
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">
              ניסיון חינם פעיל 🎉
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                נותרו <span className="font-bold text-blue-600">{daysLeftInTrial} ימים</span> לניסיון החינם
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/payment">
            <Button 
              size="sm"
              className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] hover:from-[#1A2347] hover:to-[#45A049] text-white rounded-xl"
            >
              בחר חבילה
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
