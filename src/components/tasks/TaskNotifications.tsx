
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Smartphone, Monitor } from "lucide-react";
import { toast } from "sonner";
import { type Task } from "@/types/task";

interface TaskNotificationsProps {
  task: Task;
  onClose: () => void;
}

export function TaskNotifications({ task, onClose }: TaskNotificationsProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [mobileEnabled, setMobileEnabled] = useState(false);

  useEffect(() => {
    setNotificationPermission(Notification.permission);
  }, []);

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        toast.success("הרשאת התראות אושרה!");
      } else {
        toast.error("הרשאת התראות נדחתה");
      }
    }
  };

  const scheduleNotification = (minutesBefore: number) => {
    if (!task.due_date) return;
    
    const taskDate = new Date(task.due_date);
    const notificationTime = new Date(taskDate.getTime() - (minutesBefore * 60 * 1000));
    const now = new Date();
    
    if (notificationTime <= now) {
      toast.error("לא ניתן להגדיר תזכורת למועד שכבר עבר");
      return;
    }
    
    const timeUntilNotification = notificationTime.getTime() - now.getTime();
    
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification(`תזכורת למשימה: ${task.title}`, {
          body: `המשימה מתחילה בעוד ${minutesBefore} דקות`,
          icon: "/favicon.ico",
          tag: task.id
        });
      }
      
      toast(`תזכורת למשימה: ${task.title}`, {
        description: `המשימה מתחילה בעוד ${minutesBefore} דקות`
      });
    }, timeUntilNotification);
    
    toast.success(`תזכורת נקבעה ל-${minutesBefore} דקות לפני המשימה`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2F3C7E]">
          <Bell className="h-5 w-5" />
          תזכורות למשימה: {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationPermission !== "granted" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-3">
              כדי לקבל התראות, יש צורך באישור הרשאות
            </p>
            <Button 
              onClick={requestNotificationPermission}
              className="w-full"
              variant="outline"
            >
              אשר התראות
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-[#2F3C7E]" />
              <Label htmlFor="desktop">התראות מחשב</Label>
            </div>
            <Switch 
              id="desktop" 
              checked={desktopEnabled}
              onCheckedChange={setDesktopEnabled}
              disabled={notificationPermission !== "granted"}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-[#2F3C7E]" />
              <Label htmlFor="mobile">התראות מובייל</Label>
            </div>
            <Switch 
              id="mobile" 
              checked={mobileEnabled}
              onCheckedChange={setMobileEnabled}
              disabled={notificationPermission !== "granted"}
            />
          </div>
        </div>
        
        {(desktopEnabled || mobileEnabled) && notificationPermission === "granted" && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">קבע תזכורת:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scheduleNotification(15)}
                className="text-xs"
              >
                15 דקות לפני
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scheduleNotification(30)}
                className="text-xs"
              >
                30 דקות לפני
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scheduleNotification(60)}
                className="text-xs"
              >
                שעה לפני
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scheduleNotification(1440)}
                className="text-xs"
              >
                יום לפני
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} className="flex-1">
            סגור
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
