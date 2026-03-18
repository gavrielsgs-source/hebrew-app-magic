
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Smartphone, Monitor } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";

export function MobileNotificationSettings() {
  const { permission, isSupported, preferences, requestPermission, updatePreferences } = usePushNotifications();
  const { toast } = useToast();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();

    if (granted) {
      toast({
        title: "הרשאה נתקבלה",
        description: "התראות push מופעלות בהצלחה",
      });
      return;
    }

    toast({
      title: permission === "denied" ? "ההתראות חסומות" : "לא ניתן להפעיל התראות push",
      description:
        permission === "denied"
          ? "יש לאפשר התראות בהגדרות האתר בדפדפן ואז לנסות שוב"
          : "לא ניתן להפעיל התראות push כרגע",
      variant: "destructive",
    });
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({
      ...preferences,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="text-right">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-start gap-3">
          <Bell className="h-5 w-5 text-primary" />
          הגדרות התראות
        </h3>
        <p className="text-sm text-muted-foreground">
          נהל את העדפות ההתראות שלך
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-start gap-3">
              <Smartphone className="h-4 w-4 text-primary" />
              התראות דחיפה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground text-right">
                {permission === "granted" ? "מופעל" : permission === "denied" ? "חסום בדפדפן" : "לא מופעל"}
              </div>
              <div className="text-sm font-medium">סטטוס נוכחי</div>
            </div>
            
            {permission === "default" && (
              <Button 
                onClick={handleRequestPermission}
                size="sm"
                className="w-full"
                disabled={!isSupported}
              >
                {!isSupported ? "לא נתמך בדפדפן זה" : "אפשר התראות דחיפה"}
              </Button>
            )}

            {permission === "denied" && (
              <p className="text-xs text-destructive text-right">
                ההתראות חסומות ברמת הדפדפן. צריך לאפשר אותן בהגדרות האתר.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-start gap-3">
              <Monitor className="h-4 w-4 text-primary" />
              סוגי התראות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Switch
                checked={preferences.tasks}
                onCheckedChange={(checked) => handlePreferenceChange('tasks', checked)}
                disabled={permission !== "granted"}
              />
              <Label className="text-sm">משימות</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={preferences.meetings}
                onCheckedChange={(checked) => handlePreferenceChange('meetings', checked)}
                disabled={permission !== "granted"}
              />
              <Label className="text-sm">פגישות</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={preferences.leads}
                onCheckedChange={(checked) => handlePreferenceChange('leads', checked)}
                disabled={permission !== "granted"}
              />
              <Label className="text-sm">לידים חדשים</Label>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={preferences.reminders}
                onCheckedChange={(checked) => handlePreferenceChange('reminders', checked)}
                disabled={permission !== "granted"}
              />
              <Label className="text-sm">תזכורות כלליות</Label>
            </div>

            {permission !== "granted" && (
              <p className="text-xs text-muted-foreground text-right pt-2">
                כדי לשנות העדפות, יש לאשר הרשאות התראות תחילה
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
