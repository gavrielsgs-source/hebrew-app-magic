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
  const { subscription, isLoading, isTrialExpired } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // אם עדיין טוען, לא עושים כלום
    if (isLoading) return;

    // אם הדף ברשימת החריגים, לא בודקים
    if (WHITELISTED_PATHS.some(path => location.pathname.startsWith(path))) {
      return;
    }

    // חסימה מיידית אם הניסיון פג תוקף
    if (isTrialExpired) {
      console.log('🚫 Trial expired, blocking access to:', location.pathname);
      navigate('/subscription/expired', { replace: true });
      return;
    }

    // בדיקה נוספת: אם המנוי לא פעיל
    if (!subscription?.active) {
      console.log('🚫 Subscription not active, blocking access to:', location.pathname);
      navigate('/subscription/expired', { replace: true });
      return;
    }
  }, [subscription, isLoading, isTrialExpired, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">טוען מידע על המנוי...</p>
      </div>
    );
  }

  return <>{children}</>;
}
