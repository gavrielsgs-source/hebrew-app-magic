import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { UserInvitations } from "@/components/company/UserInvitations";
import { useCompanies } from "@/hooks/use-companies";
import { useAuth } from "@/hooks/use-auth";

export default function CompanyUsers() {
  const { companyId } = useParams<{ companyId: string }>();
  const { companies, isLoading } = useCompanies();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!companyId) {
    return <Navigate to="/companies" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  const company = companies.find(c => c.id === companyId);

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              חברה לא נמצאה
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
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
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="border-b bg-card shadow-sm">
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
              <h1 className="text-2xl font-bold text-foreground">
                ניהול משתמשים - {company.name}
              </h1>
              <p className="text-muted-foreground">
                הזמן משתמשים חדשים ונהל הרשאות גישה
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                הזמנות משתמשים
              </h2>
              <p className="text-sm text-muted-foreground">
                שלח הזמנות למשתמשים חדשים ונהל משתמשים קיימים
              </p>
            </div>
          </div>

          <UserInvitations 
            companyId={companyId} 
            companyName={company.name}
          />
        </div>
      </div>
    </div>
  );
}