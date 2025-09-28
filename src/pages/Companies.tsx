import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { CompanyManagement } from "@/components/company/CompanyManagement";

export default function Companies() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">טוען...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-right">
            ניהול חברות
          </h1>
          <p className="text-gray-600 mt-2 text-right">
            נהל את החברות שלך, המשתמשים והמנויים
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <CompanyManagement />
      </div>
    </div>
  );
}