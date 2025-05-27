
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Smartphone, Monitor } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    preferences,
    requestPermission,
    updatePreferences
  } = usePushNotifications();

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({
      ...preferences,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-start gap-2">
          <Bell className="h-5 w-5" />
          הגדרות התראות
        </CardTitle>
        <CardDescription className="text-right">
          נהל את העדפות ההתראות שלך
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Permission */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-right flex-1">
              <Label className="text-base font-medium">התראות פוש</Label>
              <p className="text-sm text-muted-foreground">
                קבל התראות ישירות למכשיר שלך
              </p>
            </div>
            <div className="flex items-center gap-2 mr-4">
              {permission === "granted" ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">פעיל</span>
                </div>
              ) : (
                <Button 
                  onClick={requestPermission}
                  disabled={!isSupported}
                  size="sm"
                >
                  {!isSupported ? "לא נתמך" : "הפעל התראות"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notification Type Preferences */}
        <div className="space-y-4">
          <Label className="text-base font-medium">סוגי התראות</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="tasks" className="flex items-center justify-start gap-2 flex-1">
                <Monitor className="h-4 w-4" />
                משימות
              </Label>
              <Switch
                id="tasks"
                checked={preferences.tasks}
                onCheckedChange={(checked) => handlePreferenceChange('tasks', checked)}
                disabled={permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="meetings" className="flex items-center justify-start gap-2 flex-1">
                <Monitor className="h-4 w-4" />
                פגישות
              </Label>
              <Switch
                id="meetings"
                checked={preferences.meetings}
                onCheckedChange={(checked) => handlePreferenceChange('meetings', checked)}
                disabled={permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="leads" className="flex items-center justify-start gap-2 flex-1">
                <Monitor className="h-4 w-4" />
                לידים חדשים
              </Label>
              <Switch
                id="leads"
                checked={preferences.leads}
                onCheckedChange={(checked) => handlePreferenceChange('leads', checked)}
                disabled={permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reminders" className="flex items-center justify-start gap-2 flex-1">
                <Monitor className="h-4 w-4" />
                תזכורות כלליות
              </Label>
              <Switch
                id="reminders"
                checked={preferences.reminders}
                onCheckedChange={(checked) => handlePreferenceChange('reminders', checked)}
                disabled={permission !== "granted"}
              />
            </div>
          </div>
        </div>

        {permission !== "granted" && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-right">
              כדי לקבל התראות פוש, יש לאשר הרשאות בדפדפן
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
