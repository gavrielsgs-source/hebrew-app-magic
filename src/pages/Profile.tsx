import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { User, Phone, Building, Briefcase, Save, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";

export default function Profile() {
  const { profile, updateProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
          <div className="w-16 h-16 bg-gradient-to-br from-carslead-purple to-carslead-lightpurple rounded-full flex items-center justify-center mx-auto animate-pulse">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
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
        <div className="space-y-4 p-4">
          {/* Header Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-white text-carslead-purple text-2xl font-bold">
                    {formData.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-2">
                    {formData.full_name || "שם המשתמש"}
                  </h1>
                  <p className="text-carslead-lightblue text-base">
                    {formData.position || "תפקיד לא צוין"} 
                    {formData.company_name && ` ב${formData.company_name}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="notifications" className="space-y-4" dir="rtl">
            <div className="bg-white rounded-xl border border-gray-200 p-2">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50">
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm flex items-center justify-center"
                >
                  <Bell className="h-4 w-4 ml-2" />
                  התראות
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm flex items-center justify-center"
                >
                  <User className="h-4 w-4 ml-2" />
                  פרטים אישיים
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="notifications">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <NotificationSettings />
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200 text-right">
                  <CardTitle className="text-lg text-gray-900 flex items-center justify-end gap-3">
                    <span>עריכת פרטים אישיים</span>
                    <User className="h-5 w-5 text-carslead-purple" />
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-right">
                    עדכן את הפרטים האישיים שלך כאן. המידע ישמר באופן מאובטח במערכת.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                          <span>שם מלא</span>
                          <User className="h-4 w-4 text-carslead-purple" />
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="הכנס שם מלא"
                          className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                          <span>מספר טלפון</span>
                          <Phone className="h-4 w-4 text-carslead-purple" />
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="הכנס מספר טלפון"
                          className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                          <span>שם החברה</span>
                          <Building className="h-4 w-4 text-carslead-purple" />
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="הכנס שם חברה"
                          className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="position" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                          <span>תפקיד</span>
                          <Briefcase className="h-4 w-4 text-carslead-purple" />
                        </Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="הכנס תפקיד"
                          className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex justify-start">
                      <Button 
                        type="submit" 
                        disabled={updateProfile.isPending}
                        className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple hover:from-carslead-lightpurple hover:to-carslead-purple text-white h-12 px-6 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 w-full"
                      >
                        <Save className="h-4 w-4" />
                        {updateProfile.isPending ? "שומר שינויים..." : "שמור שינויים"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MobileContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple p-6">
            <div className="flex items-center space-x-6 space-x-reverse">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-white text-carslead-purple text-2xl font-bold">
                  {formData.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {formData.full_name || "שם המשתמש"}
                </h1>
                <p className="text-carslead-lightblue text-lg">
                  {formData.position || "תפקיד לא צוין"} 
                  {formData.company_name && ` ב${formData.company_name}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50">
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm flex items-center justify-center"
              >
                <Bell className="h-4 w-4 ml-2" />
                התראות
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-white data-[state=active]:text-carslead-purple data-[state=active]:shadow-sm flex items-center justify-center"
              >
                <User className="h-4 w-4 ml-2" />
                פרטים אישיים
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <NotificationSettings />
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 text-right">
                <CardTitle className="text-xl text-gray-900 flex items-center justify-end gap-3">
                  <span>עריכת פרטים אישיים</span>
                  <User className="h-5 w-5 text-carslead-purple" />
                </CardTitle>
                <CardDescription className="text-gray-600 text-right">
                  עדכן את הפרטים האישיים שלך כאן. המידע ישמר באופן מאובטח במערכת.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                        <span>שם מלא</span>
                        <User className="h-4 w-4 text-carslead-purple" />
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="הכנס שם מלא"
                        className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                        <span>מספר טלפון</span>
                        <Phone className="h-4 w-4 text-carslead-purple" />
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="הכנס מספר טלפון"
                        className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                        <span>שם החברה</span>
                        <Building className="h-4 w-4 text-carslead-purple" />
                      </Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="הכנס שם חברה"
                        className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="position" className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                        <span>תפקיד</span>
                        <Briefcase className="h-4 w-4 text-carslead-purple" />
                      </Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="הכנס תפקיד"
                        className="h-12 border-gray-300 focus:border-carslead-purple focus:ring-carslead-purple text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-start">
                    <Button 
                      type="submit" 
                      disabled={updateProfile.isPending}
                      className="bg-gradient-to-l from-carslead-purple to-carslead-lightpurple hover:from-carslead-lightpurple hover:to-carslead-purple text-white h-12 px-8 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfile.isPending ? "שומר שינויים..." : "שמור שינויים"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
