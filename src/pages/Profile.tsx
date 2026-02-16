import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { MobileNotificationSettings } from "@/components/notifications/MobileNotificationSettings";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Mail, User, Phone, Building, Save, Bell, Briefcase, Globe, FileText, MapPin, Hash, CheckCircle, ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { InventorySettingsTab } from "@/components/profile/InventorySettingsTab";
import { CompanyLogoUpload } from "@/components/profile/CompanyLogoUpload";

export default function Profile() {
  const { profile, updateProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company_name: "",
    position: "",
    accountant_email: "",
    company_address: "",
    company_hp: "",
    company_authorized_dealer: false,
    company_logo_url: null as string | null,
    company_type: "" as string,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        company_name: profile.company_name || "",
        position: profile.position || "",
        accountant_email: profile.accountant_email || "",
        company_address: profile.company_address || "",
        company_hp: profile.company_hp || "",
        company_authorized_dealer: profile.company_authorized_dealer || false,
        company_logo_url: profile.company_logo_url || null,
        company_type: profile.company_type || (profile.company_authorized_dealer ? "authorized_dealer" : ""),
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Derive company_authorized_dealer from company_type for backward compatibility
      const dataToSave = {
        ...formData,
        company_authorized_dealer: formData.company_type === 'authorized_dealer',
        company_type: formData.company_type || null,
      };
      await updateProfile.mutateAsync(dataToSave as any);
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
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <div className="text-xl font-semibold text-foreground">טוען פרופיל...</div>
            <div className="text-sm text-muted-foreground">אנא המתן רגע</div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <MobileContainer className="bg-background" withPadding={false}>
        <div className="space-y-4 p-4" dir="rtl">
          {/* Header Section */}
          <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-l from-primary to-primary/80 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white/20 shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-white text-primary text-2xl font-bold">
                    {formData.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-primary-foreground text-right flex-1">
                  <h1 className="text-xl font-bold mb-1">
                    {formData.full_name || "שם המשתמש"}
                  </h1>
                  <p className="text-primary-foreground/80 text-sm">
                    {formData.position || "תפקיד לא צוין"} 
                    {formData.company_name && ` ב${formData.company_name}`}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="profile" className="space-y-4">
            <Card className="shadow-lg rounded-2xl border-2">
              <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl h-12 flex-row-reverse">
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  התראות
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  פרטים אישיים
                </TabsTrigger>
              </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="profile" className="space-y-4">
              <Card className="shadow-lg rounded-2xl border-2">
                <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 flex-row-reverse justify-end">
                    <User className="h-5 w-5 text-primary" />
                    עריכת פרטים אישיים
                  </CardTitle>
                  <p className="text-sm text-muted-foreground text-right">
                    עדכן את הפרטים האישיים שלך כאן. המידע ישמר באופן מאובטח במערכת.
                  </p>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        שם מלא
                        <User className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="הכנס שם מלא"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        מספר טלפון
                        <Phone className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="הכנס מספר טלפון"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        שם החברה
                        <Building className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="הכנס שם חברה"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        תפקיד
                        <Briefcase className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="הכנס תפקיד"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Accountant Email */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        מייל רואה חשבון
                        <Mail className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        type="email"
                        value={formData.accountant_email}
                        onChange={(e) => setFormData({ ...formData, accountant_email: e.target.value })}
                        placeholder="accountant@example.com"
                        className="h-12 rounded-xl border-2 text-left"
                        dir="ltr"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        כתובת המייל לשליחת דוחות חודשיים
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateProfile.isPending}
                        className="w-full h-12 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
              <Card className="shadow-lg rounded-2xl border-2">
                <CardContent className="p-4">
                  <MobileNotificationSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MobileContainer>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-l from-primary to-primary/80 p-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-white text-primary text-3xl font-bold">
                  {formData.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-primary-foreground text-right flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {formData.full_name || "שם המשתמש"}
                </h1>
                <p className="text-primary-foreground/80 text-lg">
                  {formData.position || "תפקיד לא צוין"} 
                  {formData.company_name && ` ב${formData.company_name}`}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <Card className="shadow-lg rounded-2xl border-2">
            <CardContent className="p-2">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl h-14 flex-row-reverse">
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2 text-base"
                >
                  <Bell className="h-5 w-5" />
                  התראות
                </TabsTrigger>
                <TabsTrigger 
                  value="inventory"
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2 text-base"
                >
                  <Globe className="h-5 w-5" />
                  דף מלאי
                </TabsTrigger>
                <TabsTrigger 
                  value="company"
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2 text-base"
                >
                  <FileText className="h-5 w-5" />
                  פרטי חברה
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2 text-base"
                >
                  <User className="h-5 w-5" />
                  פרטים אישיים
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="profile">
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2 flex-row-reverse justify-end">
                  <User className="h-5 w-5 text-primary" />
                  עריכת פרטים אישיים
                </CardTitle>
                <p className="text-sm text-muted-foreground text-right">
                  עדכן את הפרטים האישיים שלך כאן. המידע ישמר באופן מאובטח במערכת.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        שם מלא
                        <User className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="הכנס שם מלא"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        מספר טלפון
                        <Phone className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="הכנס מספר טלפון"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        שם החברה
                        <Building className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="הכנס שם חברה"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        תפקיד
                        <Briefcase className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="הכנס תפקיד"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Accountant Email - Full width */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        מייל רואה חשבון
                        <Mail className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        type="email"
                        value={formData.accountant_email}
                        onChange={(e) => setFormData({ ...formData, accountant_email: e.target.value })}
                        placeholder="accountant@example.com"
                        className="h-12 rounded-xl border-2 text-left max-w-md"
                        dir="ltr"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        כתובת המייל לשליחת דוחות חודשיים
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfile.isPending}
                      className="h-12 px-8 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfile.isPending ? "שומר שינויים..." : "שמור שינויים"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card className="shadow-lg rounded-2xl border-2">
              <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2 flex-row-reverse justify-end">
                  <FileText className="h-5 w-5 text-primary" />
                  פרטי חברה למסמכים
                </CardTitle>
                <p className="text-sm text-muted-foreground text-right">
                  פרטים אלו יופיעו בכל המסמכים שתפיק (חשבוניות, קבלות, הצעות מחיר וכו')
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        שם החברה
                        <Building className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="הכנס שם חברה"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Company HP */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        מספר עוסק מורשה / ח.פ
                        <Hash className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.company_hp}
                        onChange={(e) => setFormData({ ...formData, company_hp: e.target.value })}
                        placeholder="הכנס מספר עוסק מורשה"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Company Address */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        כתובת החברה
                        <MapPin className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.company_address}
                        onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                        placeholder="הכנס כתובת מלאה (רחוב, עיר, מיקוד)"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Company Phone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        טלפון החברה
                        <Phone className="h-4 w-4 text-primary" />
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="הכנס מספר טלפון"
                        className="h-12 rounded-xl border-2 text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Company Type */}
                    <div className="space-y-2 flex flex-col justify-end">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                        סוג עוסק
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </Label>
                      <select
                        value={formData.company_type}
                        onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                        className="h-12 rounded-xl border-2 border-border bg-background text-foreground text-right px-4 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        dir="rtl"
                      >
                        <option value="">לא צוין</option>
                        <option value="authorized_dealer">עוסק מורשה</option>
                        <option value="ltd">חברה בע"מ</option>
                        <option value="exempt">עוסק פטור</option>
                      </select>
                    </div>

                    {/* Company Logo */}
                    <div className="md:col-span-2">
                      <CompanyLogoUpload
                        currentLogoUrl={formData.company_logo_url}
                        onLogoChange={(url) => setFormData({ ...formData, company_logo_url: url })}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfile.isPending}
                      className="h-12 px-8 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfile.isPending ? "שומר שינויים..." : "שמור פרטי חברה"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <InventorySettingsTab />
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-lg rounded-2xl border-2">
              <NotificationSettings />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
