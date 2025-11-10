
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import SubscriptionGuard from "./SubscriptionGuard";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireSubscriptionCheck?: boolean;
};

export default function ProtectedRoute({ children, requireSubscriptionCheck = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // כשטוען את האימות, מציג מסך טעינה
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">מאמת הרשאות...</p>
      </div>
    );
  }

  // אם המשתמש לא מחובר, מעביר אותו לעמוד ההתחברות
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // אם המשתמש מחובר, בודקים מנוי (אם נדרש)
  if (requireSubscriptionCheck) {
    return (
      <SubscriptionGuard>
        {children}
      </SubscriptionGuard>
    );
  }

  // אם לא צריך בדיקת מנוי, מציג את התוכן
  return <>{children}</>;
}
