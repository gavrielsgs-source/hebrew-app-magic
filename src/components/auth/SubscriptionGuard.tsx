import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/contexts/subscription-context";

interface SubscriptionGuardProps {
  children: ReactNode;
}

const WHITELISTED_PATHS = [
  '/payment',
  '/subscription',
  '/subscription/upgrade',
  '/subscription/expired',
  '/subscription/manage',
  '/subscription/payment-success',
  '/subscription/payment-error',
  '/welcome'
];

const GRACE_PERIOD_HOURS = 48;

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // אם עדיין טוען, לא עושים כלום
    if (isLoading) return;

    // אם הדף ברשימת החריגים, לא בודקים
    if (WHITELISTED_PATHS.some(path => location.pathname.startsWith(path))) {
      return;
    }

    // בדיקה אם המנוי פג תוקף
    const isExpiredOrPastDue = subscription?.subscription_status === 'expired' || 
                                subscription?.subscription_status === 'past_due';

    if (!isExpiredOrPastDue) {
      return; // הכל תקין
    }

    // בדיקה אם עברו 48 שעות מאז הפקיעה
    const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
    
    if (!expiresAt) {
      // אין תאריך פקיעה - חוסמים
      navigate('/subscription/expired', { replace: true });
      return;
    }

    const now = new Date();
    const hoursSinceExpiration = (now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60);

    // אם עברו יותר מ-48 שעות - חוסמים
    if (hoursSinceExpiration > GRACE_PERIOD_HOURS) {
      navigate('/subscription/expired', { replace: true });
    }
    
    // אם בתוך 48 שעות - מאפשרים כניסה עם אזהרה (האזהרה מוצגת ב-GracePeriodWarning)
  }, [subscription, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">טוען מידע על המנוי...</p>
      </div>
    );
  }

  return <>{children}</>;
}
