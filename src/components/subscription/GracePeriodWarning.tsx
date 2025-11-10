import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/subscription-context";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const GRACE_PERIOD_HOURS = 48;

export function GracePeriodWarning() {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hoursLeft, setHoursLeft] = useState<number>(0);

  useEffect(() => {
    // בדיקה אם המנוי פג תוקף
    const isExpiredOrPastDue = subscription?.subscription_status === 'expired' || 
                                subscription?.subscription_status === 'past_due';

    if (!isExpiredOrPastDue || !subscription?.expiresAt) {
      setIsVisible(false);
      return;
    }

    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    const hoursSinceExpiration = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60);

    // אם בתוך תקופת החסד - מציגים את האזהרה
    if (hoursSinceExpiration >= 0 && hoursSinceExpiration <= GRACE_PERIOD_HOURS) {
      setIsVisible(true);
      setHoursLeft(Math.ceil(GRACE_PERIOD_HOURS - hoursSinceExpiration));
    } else {
      setIsVisible(false);
    }

    // עדכון כל דקה
    const interval = setInterval(() => {
      const now = new Date();
      const hoursSinceExpiration = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceExpiration <= GRACE_PERIOD_HOURS) {
        setHoursLeft(Math.ceil(GRACE_PERIOD_HOURS - hoursSinceExpiration));
      } else {
        setIsVisible(false);
      }
    }, 60000); // כל דקה

    return () => clearInterval(interval);
  }, [subscription]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground shadow-lg animate-in slide-in-from-top-5" dir="rtl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 rounded-full p-2 animate-pulse">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg mb-1">
                ⚠️ תקופת המנוי שלך הסתיימה - נותרו {hoursLeft} שעות!
              </p>
              <p className="text-sm opacity-90">
                הגישה למערכת תיחסם בעוד {hoursLeft} שעות. שדרג עכשיו כדי להמשיך להשתמש בכל התכונות.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/subscription/upgrade')}
              variant="secondary"
              size="lg"
              className="bg-white text-destructive hover:bg-white/90 font-bold shadow-lg"
            >
              שדרג עכשיו 🚀
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
