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

    // בדיקה אם הניסיון נגמר (trial_ends_at עבר)
    const isTrialExpired = subscription?.subscription_status === 'trial' &&
                           subscription?.trialEndsAt && 
                           new Date(subscription.trialEndsAt) < new Date();

    // אם המנוי פג או הניסיון נגמר - חסימה מיידית
    if (isExpiredOrPastDue || isTrialExpired) {
      navigate('/subscription/expired', { replace: true });
      return;
    }
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
