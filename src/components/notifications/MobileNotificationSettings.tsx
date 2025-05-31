
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Smartphone, Mail, MessageSquare } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";

export function MobileNotificationSettings() {
  const { permission, requestPermission } = usePushNotifications();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
      toast({
        title: "הרשאה נתקבלה",
        description: "התראות push מופעלות בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להפעיל התראות push",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="text-right">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-start gap-3">
          <Bell className="h-5 w-5 text-blue-600" />
          הגדרות התראות
        </h3>
        <p className="text-sm text-gray-600">
          נהל את העדפות ההתראות שלך
        </p>
      </div>

      <div className="space-y-4">
        {/* Push Notifications */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-start gap-3">
              <Smartphone className="h-4 w-4 text-blue-600" />
              התראות דחיפה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 text-right">
                {permission === "granted" ? "מופעל" : permission === "denied" ? "נדחה" : "לא מופעל"}
              </div>
              <div className="text-sm font-medium">סטטוס נוכחי</div>
            </div>
            
            {permission !== "granted" && (
              <Button 
                onClick={handleRequestPermission}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                אפשר התראות דחיפה
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-start gap-3">
              <Mail className="h-4 w-4 text-green-600" />
              התראות אימייל
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Switch 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
              <Label className="text-sm">קבל התראות באימייל</Label>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-start gap-3">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              התראות SMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Switch 
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
              <Label className="text-sm">קבל התראות בSMS</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
