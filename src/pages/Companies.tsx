import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Settings, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/subscription-context";

export default function Companies() {
  const { user, loading } = useAuth();
  const { companies, isLoading: companiesLoading, createCompany } = useCompanies();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 text-right">
            <div className="text-xl font-semibold text-gray-900">טוען חברות...</div>
            <div className="text-sm text-gray-600">אנא המתן רגע</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                החברות שלי
              </h1>
              <p className="text-gray-600">
                נהל את החברות שלך והגדר משתמשים לכל חברה
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {subscription.tier} • {companies.length} חברות
              </Badge>
              <Button
                onClick={() => createCompany.mutateAsync("חברה חדשה")}
                disabled={createCompany.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 ml-2" />
                חברה חדשה
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {companiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent>
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                אין חברות עדיין
              </h3>
              <p className="text-gray-600 mb-6">
                צור את החברה הראשונה שלך כדי להתחיל לנהל לקוחות ומשתמשים
              </p>
              <Button
                onClick={() => createCompany.mutateAsync("החברה שלי")}
                disabled={createCompany.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 ml-2" />
                צור חברה ראשונה
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge variant="secondary" className="bg-white/80">
                      חברה
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-right mt-4 group-hover:text-purple-600 transition-colors">
                    {company.name}
                  </CardTitle>
                  <CardDescription className="text-right text-gray-600">
                    נוצרה ב-{new Date(company.created_at).toLocaleDateString('he-IL')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">בעלים</span>
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
                        onClick={() => navigate(`/company/${company.id}/settings`)}
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