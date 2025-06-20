
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, CheckCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationPermissionCard() {
  const { permission, requestPermission, showTestNotification, isSupported } = usePushNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  if (!isSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            התראות לא נתמכות
          </CardTitle>
          <CardDescription className="text-orange-700">
            הדפדפן שלך לא תומך בהתראות push
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission === 'granted') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            התראות מופעלות
          </CardTitle>
          <CardDescription className="text-green-700">
            תקבל התראות עבור המשימות שלך
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={showTestNotification}
            variant="outline"
            size="sm"
            className="text-green-800 border-green-300 hover:bg-green-100"
          >
            שלח התראת בדיקה
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          אפשר התראות
        </CardTitle>
        <CardDescription className="text-blue-700">
          כדי לקבל תזכורות למשימות שלך, יש צורך באישור הרשאות התראות
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isRequesting ? "מבקש הרשאות..." : "אפשר התראות"}
        </Button>
      </CardContent>
    </Card>
  );
}
