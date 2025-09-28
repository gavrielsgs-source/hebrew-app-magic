import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CompanySettings as CompanySettingsComponent } from "@/components/company/CompanySettings";
import { useCompanies } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";
import { useRealAdminCheck } from "@/hooks/use-real-admin-check";

export default function CompanySettings() {
  const { companyId } = useParams<{ companyId: string }>();
  const { companies, isLoading } = useCompanies();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useRealAdminCheck();

  if (!companyId) {
    return <Navigate to="/companies" replace />;
  }

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-64 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-32 bg-gray-200 animate-pulse rounded" />
            <div className="h-64 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  const company = companies.find(c => c.id === companyId);

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              חברה לא נמצאה
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              החברה שאתה מחפש לא קיימת או שאין לך הרשאה לצפות בה
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              חזור
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">
                הגדרות חברה - {company.name}
              </h1>
              <p className="text-gray-600">
                נהל את החברה שלך, משתמשים והרשאות
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <CompanySettingsComponent companyId={companyId} />
      </div>
    </div>
  );
}