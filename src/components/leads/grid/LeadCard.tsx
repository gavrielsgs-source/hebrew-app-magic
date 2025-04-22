
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Phone, MessageSquare, Car, Calendar } from "lucide-react";
import { toast } from "sonner";

interface LeadCardProps {
  lead: any;
  onContactClick?: () => void;
  onScheduleClick?: () => void;
}

export function LeadCard({ lead, onContactClick, onScheduleClick }: LeadCardProps) {
  const handleContactClick = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_blank');
    } else {
      toast.error("אין מספר טלפון רשום ללקוח זה");
    }
    
    if (onContactClick) {
      onContactClick();
    }
  };

  const handleScheduleClick = () => {
    // אם יש פונקציית קביעת פגישה שהועברה, השתמש בה
    if (onScheduleClick) {
      onScheduleClick();
      return;
    }
    
    // אחרת השתמש בפתרון ברירת מחדל - פתיחת יומן
    try {
      const date = new Date();
      date.setDate(date.getDate() + 1); // יום אחד קדימה
      date.setHours(10, 0, 0, 0); // 10:00 בבוקר
      
      const endDate = new Date(date);
      endDate.setHours(11, 0, 0, 0); // שעה אחרי
      
      const formattedStart = date.toISOString().replace(/-|:|\.\d+/g, "");
      const formattedEnd = endDate.toISOString().replace(/-|:|\.\d+/g, "");
      
      const event = {
        text: `פגישה עם ${lead.name}`,
        dates: `${formattedStart}/${formattedEnd}`,
        details: `פגישה בנושא רכב ${lead.cars ? lead.cars.make + ' ' + lead.cars.model : ''}`,
      };
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates}&details=${encodeURIComponent(event.details)}`;
      
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      toast.error("אירעה שגיאה בקביעת הפגישה");
      console.error("Calendar error:", error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 backdrop-blur-sm bg-white/90">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start">
          <Badge className={getStatusBadgeColor(lead.status)}>
            {getStatusText(lead.status)}
          </Badge>
          <div className="text-right">
            <h3 className="text-lg font-semibold">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lead.phone && (
          <div className="flex items-center gap-2 flex-row-reverse">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{lead.phone}</span>
          </div>
        )}
        {lead.source && (
          <div className="flex items-center gap-2 flex-row-reverse">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">מקור: {lead.source}</span>
          </div>
        )}
        {lead.cars && (
          <div className="flex items-center gap-2 flex-row-reverse">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {lead.cars.make} {lead.cars.model} {lead.cars.year}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-row-reverse">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(lead.created_at).toLocaleDateString("he-IL")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Button 
          variant="outline" 
          className="flex-1 h-10 flex gap-2 items-center justify-center" 
          onClick={handleContactClick}
        >
          <Phone className="h-4 w-4" />
          צור קשר
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 h-10 flex gap-2 items-center justify-center"
          onClick={handleScheduleClick}
        >
          <Calendar className="h-4 w-4" />
          קבע פגישה
        </Button>
      </CardFooter>
    </Card>
  );
}

function getStatusBadgeColor(status: string | null) {
  switch (status) {
    case "new":
      return "bg-blue-500 hover:bg-blue-600";
    case "in_progress":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "waiting":
      return "bg-purple-500 hover:bg-purple-600";
    case "closed":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

function getStatusText(status: string | null) {
  switch (status) {
    case "new":
      return "חדש";
    case "in_progress":
      return "בטיפול";
    case "waiting":
      return "בהמתנה";
    case "closed":
      return "סגור";
    default:
      return "לא ידוע";
  }
}
