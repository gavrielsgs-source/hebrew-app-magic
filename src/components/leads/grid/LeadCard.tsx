
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Send, Edit, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { EditLeadForm } from "../EditLeadForm";

interface LeadCardProps {
  lead: any;
}

export function LeadCard({ lead }: LeadCardProps) {
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/30 text-white">
              {lead.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium leading-none">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </p>
          </div>
          <Badge className={getStatusBadgeColor(lead.status)}>
            {getStatusText(lead.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 space-y-2">
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span dir="ltr">{lead.phone}</span>
          </div>
        )}
        
        {lead.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span dir="ltr">{lead.email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="bg-orange-500/10 hover:bg-orange-500/20">
            מקור: {lead.source || "ידני"}
          </Badge>
          
          {lead.cars && (
            <Badge variant="outline" className="bg-blue-500/10 hover:bg-blue-500/20">
              התעניין ב: {lead.cars.make} {lead.cars.model}
            </Badge>
          )}
        </div>
        
        {lead.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lead.notes}
          </p>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 w-full justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              window.open(`tel:${lead.phone}`, '_blank');
            }}
            disabled={!lead.phone}
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Dialog open={isWhatsappOpen} onOpenChange={setIsWhatsappOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  if (lead.cars) {
                    setIsWhatsappOpen(true);
                  }
                }}
                disabled={!lead.cars}
              >
                <Send className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
              </DialogHeader>
              {lead.cars && (
                <WhatsappTemplateSelector 
                  car={lead.cars} 
                  onClose={() => setIsWhatsappOpen(false)}
                  initialPhoneNumber={lead.phone || ""}
                />
              )}
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px]">
              <SheetHeader>
                <SheetTitle>עריכת פרטי לקוח</SheetTitle>
              </SheetHeader>
              <EditLeadForm lead={lead} />
            </SheetContent>
          </Sheet>
        </div>
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
