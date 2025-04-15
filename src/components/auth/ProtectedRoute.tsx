
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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

  // אם המשתמש מחובר, מציג את תוכן העמוד המוגן
  return <>{children}</>;
}
