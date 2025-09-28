import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { MobileNotificationSettings } from "@/components/notifications/MobileNotificationSettings";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Shield, Mail, User, Eye, Phone, Building, ChevronRight, MapPin, Calendar, Save, Users, Bell, Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { useRoles } from "@/hooks/use-roles";
import { useCompanies } from "@/hooks/use-companies";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/subscription-context";

export default function Profile() {
  const { profile, updateProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isAdmin, isCompanyOwner } = useRoles();
  const { companies, isLoading: companiesLoading } = useCompanies();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company_name: "",
    position: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        company_name: profile.company_name || "",
        position: profile.position || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      toast({
        title: "הפרופיל עודכן",
        description: "הפרטים שלך נשמרו בהצלחה",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הפרופיל",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 text-right">
            <div className="text-xl font-semibold text-gray-900">טוען פרופיל...</div>
            <div className="text-sm text-gray-600">אנא המתן רגע</div>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileContainer className="bg-gray-50" withPadding={false}>
        <div className="space-y-4 p-4" dir="rtl">
          {/* Header Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                    {formData.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white text-right w-full">
                  <h1 className="text-2xl font-bold mb-2">
                    {formData.full_name || "שם המשתמש"}
                  </h1>
                  <p className="text-blue-200 text-base">
                    {formData.position || "תפקיד לא צוין"} 
                    {formData.company_name && ` ב${formData.company_name}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="profile" className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50" dir="rtl">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center text-right"
                >
                  <User className="h-4 w-4 mr-2" />
                  פרטים אישיים
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center text-right"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  התראות
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200 text-right">
                  <CardTitle className="text-lg text-gray-900 flex items-center justify-start gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>עריכת פרטים אישיים</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-right">
                    עדכן את הפרטים האישיים שלך כאן. המידע ישמר באופן מאובטח במערכת.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span>שם מלא</span>
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="הכנס שם מלא"
                          className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span>מספר טלפון</span>
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="הכנס מספר טלפון"
                          className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          <span>שם החברה</span>
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="הכנס שם חברה"
                          className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="position" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          <span>תפקיד</span>
                        </Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="הכנס תפקיד"
                          className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex justify-start">
                      <Button 
                        type="submit" 
                        disabled={updateProfile.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white h-12 px-6 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 w-full"
                      >
                        <Save className="h-4 w-4" />
                        {updateProfile.isPending ? "שומר שינויים..." : "שמור שינויים"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4" dir="rtl">
                  <MobileNotificationSettings />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MobileContainer>
    );
  }

  // Desktop view - keep existing desktop code but with fixed color references
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center space-x-6 space-x-reverse">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                  {formData.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-white text-right">
                <h1 className="text-3xl font-bold mb-2">
                  {formData.full_name || "שם המשתמש"}
                </h1>
                <p className="text-blue-200 text-lg">
                  {formData.position || "תפקיד לא צוין"} 
                  {formData.company_name && ` ב${formData.company_name}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access to Access Management */}
        {!companiesLoading && companies.length > 0 && (
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">ניהול הרשאות</h3>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/companies")}
                  className="text-primary border-primary/20 hover:bg-primary/10"
                >
                  <ChevronRight className="h-4 w-4 ml-2" />
                  נהל הרשאות
                </Button>
              </div>
              <div className="text-muted-foreground">
                יש לך {companies.length} {companies.length === 1 ? 'קבוצת הרשאות רשומה' : 'קבוצות הרשאות רשומות'} במערכת
              </div>
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center"
              >
                <User className="h-4 w-4 mr-2" />
                פרטים אישיים
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center justify-center"
              >
                <Bell className="h-4 w-4 mr-2" />
                התראות
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 text-right">
                <CardTitle className="text-xl text-gray-900 flex items-center justify-start gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>עריכת פרטים אישיים</span>
                </CardTitle>
                <CardDescription className="text-gray-600 text-right">
                  עדכן את הפרטים האישיים שלך כאן. המידע ישמר באופן מאובטח במערכת.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>שם מלא</span>
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="הכנס שם מלא"
                        className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span>מספר טלפון</span>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="הכנס מספר טלפון"
                        className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span>שם החברה</span>
                      </Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="הכנס שם חברה"
                        className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="position" className="text-sm font-medium text-gray-700 flex items-center justify-start gap-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span>תפקיד</span>
                      </Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="הכנס תפקיד"
                        className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-start">
                    <Button 
                      type="submit" 
                      disabled={updateProfile.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white h-12 px-8 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfile.isPending ? "שומר שינויים..." : "שמור שינויים"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <NotificationSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
