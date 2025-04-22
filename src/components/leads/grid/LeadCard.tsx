import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Phone, MessageSquare, Car, Calendar } from "lucide-react";

interface LeadCardProps {
  lead: any;
  onContactClick?: () => void;
  onScheduleClick?: () => void;
}

export function LeadCard({ lead, onContactClick, onScheduleClick }: LeadCardProps) {
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
          className="flex-1 h-10 flex-row-reverse" 
          onClick={onContactClick}
        >
          <Phone className="h-4 w-4 mr-2" />
          צור קשר
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 h-10 flex-row-reverse"
          onClick={onScheduleClick}
        >
          <Calendar className="h-4 w-4 mr-2" />
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
