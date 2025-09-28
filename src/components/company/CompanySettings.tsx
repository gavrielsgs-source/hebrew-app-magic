import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, CreditCard, Settings } from "lucide-react";
import { UserInvitations } from "./UserInvitations";
import { useCompanies, useCompanyUsers } from "@/hooks/use-companies";
import { useSubscription } from "@/contexts/subscription-context";
import { Badge } from "@/components/ui/badge";

interface CompanySettingsProps {
  companyId: string;
}

export function CompanySettings({ companyId }: CompanySettingsProps) {
  const [companyName, setCompanyName] = useState("");
  
  const { companies, updateCompany } = useCompanies();
  const { data: companyUsers = [] } = useCompanyUsers(companyId);
  const { subscription } = useSubscription();

  const company = companies.find(c => c.id === companyId);

  const handleUpdateCompany = async () => {
    if (!companyName.trim() || !company) return;

    try {
      await updateCompany.mutateAsync({
        id: company.id,
        name: companyName.trim(),
      });
      setCompanyName("");
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          חברה לא נמצאה
        </h2>
        <p className="text-gray-600">
          החברה שאתה מחפש לא קיימת או שאין לך הרשאה לצפות בה
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Company Info */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-right text-xl">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            פרטי החברה
          </CardTitle>
          <CardDescription className="text-right text-slate-600">
            נהל את פרטי החברה שלך ועדכן מידע בסיסי
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">שם החברה</Label>
              <div className="flex gap-2">
                <Input
                  id="company-name"
                  value={companyName || company.name}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={company.name}
                  className="text-right flex-1"
                />
                <Button
                  onClick={handleUpdateCompany}
                  disabled={updateCompany.isPending || !companyName.trim()}
                  size="sm"
                >
                  {updateCompany.isPending ? "מעדכן..." : "עדכן"}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>נוצרה בתאריך:</strong> {new Date(company.created_at).toLocaleDateString('he-IL')}</p>
              <p><strong>עודכנה לאחרונה:</strong> {new Date(company.updated_at).toLocaleDateString('he-IL')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-right text-xl">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-2 rounded-xl">
              <CreditCard className="h-6 w-6 text-emerald-600" />
            </div>
            פרטי המנוי
          </CardTitle>
          <CardDescription className="text-right text-slate-600">
            מידע על המנוי הנוכחי, מגבלות והטבות של החברה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">רמת מנוי:</span>
              <Badge variant="secondary">
                {subscription.tier === 'premium' ? 'פרימיום' : 
                 subscription.tier === 'business' ? 'עסקי' : 
                 subscription.tier === 'enterprise' ? 'ארגוני' : subscription.tier}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">משתמשים פעילים:</span>
              <span className="font-semibold">
                {companyUsers.length} / {subscription.userLimit === Infinity ? '∞' : subscription.userLimit}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">סטטוס:</span>
              <Badge variant={subscription.active ? "default" : "destructive"}>
                {subscription.active ? 'פעיל' : 'לא פעיל'}
              </Badge>
            </div>

            {subscription.isTrialActive && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>תקופת ניסיון פעילה</strong> - 
                  נותרו {subscription.trialEndsAt ? 
                    Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : 0} ימים
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* User Management */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-right">
          ניהול משתמשים
        </h3>
        <UserInvitations companyId={companyId} />
      </div>

      {/* Current Users */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-right text-xl">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            משתמשים פעילים
          </CardTitle>
          <CardDescription className="text-right text-slate-600">
            רשימת המשתמשים הרשומים בחברה ותפקידיהם
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companyUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                אין משתמשים פעילים
              </h3>
              <p className="text-gray-600">
                הזמן משתמשים חדשים באמצעות מערכת ההזמנות
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {companyUsers.map((userRole: any) => (
                <div
                  key={userRole.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div className="text-right">
                    <p className="font-medium">{userRole.user_id}</p>
                    <p className="text-sm text-gray-600">{userRole.agencies?.name}</p>
                  </div>
                  <Badge variant="outline">{userRole.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}