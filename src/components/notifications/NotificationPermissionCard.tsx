
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, CheckCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { toast } from "sonner";

export function NotificationPermissionCard() {
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isSupported) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            הדפדפן לא תומך בהתראות
          </CardTitle>
          <CardDescription className="text-orange-700">
            הדפדפן שלך לא תומך בהתראות פוש. תוכל עדיין ליצור תזכורות שיוצגו ברשימת המשימות.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission === "granted") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            התראות מופעלות
          </CardTitle>
          <CardDescription className="text-green-700">
            תוכל עכשיו ליצור תזכורות ולקבל התראות במועד הנדרש.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success("התראות הופעלו בהצלחה!");
      } else {
        toast.error("הרשאות התראות נדחו. תוכל לנסות שוב או להפעיל ידנית בהגדרות הדפדפן.");
      }
    } catch (error) {
      toast.error("שגיאה בהפעלת התראות");
      console.error(error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          הפעלת התראות
        </CardTitle>
        <CardDescription className="text-blue-700">
          כדי לקבל תזכורות למשימות ופגישות, יש צורך באישור הרשאות התראות.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isRequesting ? "מבקש הרשאה..." : "אפשר התראות"}
        </Button>
        <p className="text-xs text-blue-600 mt-2">
          לחץ על "אפשר" בחלון שיופיע כדי להפעיל התראות.
        </p>
      </CardContent>
    </Card>
  );
}
