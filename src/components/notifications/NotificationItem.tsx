
import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar, CheckCircle2, Bell, User, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: "reminder" | "lead" | "task" | "car" | "system";
    read: boolean;
    created_at: string;
    entityId?: string;
    entityType?: string;
  };
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const [isReading, setIsReading] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd בMMM, HH:mm", { locale: he });
    } catch (e) {
      return "תאריך לא ידוע";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "reminder":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "lead":
        return <User className="h-5 w-5 text-blue-500" />;
      case "task":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "car":
        return <Car className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // נווט לישות המתאימה
    if (notification.entityId && notification.entityType) {
      switch (notification.entityType) {
        case "lead":
          navigate(`/leads?id=${notification.entityId}`);
          break;
        case "task":
          navigate(`/tasks?id=${notification.entityId}`);
          break;
        case "car":
          navigate(`/cars?id=${notification.entityId}`);
          break;
      }
    }
    
    setIsReading(!isReading);
  };

  return (
    <div 
      className={cn(
        "p-3 hover:bg-slate-50 cursor-pointer transition-colors",
        notification.read ? "opacity-75" : "border-r-2 border-blue-500"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 pt-1">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h5 className="font-medium text-sm">{notification.title}</h5>
            <span className="text-xs text-slate-500">{formatDate(notification.created_at)}</span>
          </div>
          
          <p className={cn(
            "text-sm text-slate-600 mt-1 whitespace-pre-line", 
            isReading ? "line-clamp-none" : "line-clamp-2"
          )}>
            {notification.message}
          </p>
          
          {notification.message.length > 100 && (
            <button 
              className="text-xs text-blue-500 mt-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsReading(!isReading);
              }}
            >
              {isReading ? "הצג פחות" : "קרא עוד..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
