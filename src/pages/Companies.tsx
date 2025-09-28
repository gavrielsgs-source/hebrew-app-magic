import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useRealAdminCheck } from "@/hooks/use-real-admin-check";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, Settings, Plus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/subscription-context";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { UsageBar } from "@/components/subscription/UsageBar";
import { toast } from "sonner";

export default function AccessManagement() {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useRealAdminCheck();
  const { companies, isLoading: companiesLoading, createCompany, error: companiesError } = useCompanies();
  const { subscription } = useSubscription();
  const { checkAndNotifyLimit } = useSubscriptionLimits();
  const navigate = useNavigate();

  const handleCreateCompany = async () => {
    // Check company limit before creating
    if (!checkAndNotifyLimit('company', companies.length, async () => {
      try {
        const companyName = `קבוצת גישה ${companies.length + 1}`;
        await createCompany.mutateAsync(companyName);
        toast.success("קבוצת גישה נוצרה בהצלחה");
      } catch (error) {
        console.error("Error creating company:", error);
        toast.error("שגיאה ביצירת קבוצת גישה");
      }
    })) {
      return; // Limit exceeded, notification already shown
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <UserCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-right">
            <div className="text-xl font-semibold text-foreground">טוען הרשאות...</div>
            <div className="text-sm text-muted-foreground">אנא המתן רגע</div>
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

  // Show error state if there's an error fetching companies
  if (companiesError) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="max-w-6xl mx-auto p-6">
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-destructive">שגיאה בטעינת קבוצות הגישה</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                אירעה שגיאה בטעינת קבוצות הגישה שלך. נסה לרענן את הדף או בדוק את החיבור לאינטרנט.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="mr-2"
                >
                  רענן דף
                </Button>
                <Button 
                  onClick={() => navigate("/dashboard")} 
                  variant="secondary"
                >
                  חזור ללוח הבקרה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ניהול הרשאות גישה
              </h1>
              <p className="text-muted-foreground">
                נהל הרשאות גישה למערכת והגדר משתמשים
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {subscription.tier} • {companies.length} קבוצות
              </Badge>
              <Button
                onClick={handleCreateCompany}
                disabled={createCompany.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 ml-2" />
                {createCompany.isPending ? "יוצר..." : "קבוצת גישה חדשה"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Usage Bar for Company Limit */}
        {subscription.companyLimit !== Infinity && (
          <div className="mb-6">
            <UsageBar
              used={companies.length}
              limit={subscription.companyLimit || 0}
              label="קבוצות גישה"
              className="mb-2"
            />
            {user?.email === 'gavrielsgs@gmail.com' && (
              <p className="text-xs text-muted-foreground">
                💡 בחשבון מנהל-על (Super Admin) המגבלות מבוטלות לצורכי ניהול ובדיקות
              </p>
            )}
          </div>
        )}
        {companiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                אין קבוצות גישה עדיין
              </h3>
              <p className="text-muted-foreground mb-6">
                צור קבוצת גישה ראשונה כדי להתחיל לנהל הרשאות משתמשים
              </p>
              <Button
                onClick={handleCreateCompany}
                disabled={createCompany.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 ml-2" />
                {createCompany.isPending ? "יוצר..." : "צור קבוצת גישה ראשונה"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">
                      קבוצת גישה
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-right mt-4 group-hover:text-primary transition-colors">
                    {company.name}
                  </CardTitle>
                  <CardDescription className="text-right">
                    נוצרה ב-{new Date(company.created_at).toLocaleDateString('he-IL')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">מנהל</span>
                      <span className="font-medium">אתה</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/company/${company.id}/settings`)}
                        className="flex-1"
                      >
                        <Settings className="h-4 w-4 ml-2" />
                        הגדרות
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/company/${company.id}/users`)}
                        className="flex-1"
                      >
                        <Users className="h-4 w-4 ml-2" />
                        משתמשים
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}