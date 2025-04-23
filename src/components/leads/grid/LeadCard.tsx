
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Calendar, Clock, Send, User, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EditLeadForm } from "@/components/leads/EditLeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { useState } from "react";
import { useRoles } from "@/hooks/use-roles";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function LeadCard({ lead }: { lead: any }) {
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const { canManageLeads } = useRoles();

  // Format creation date
  const formattedDate = formatDistanceToNow(new Date(lead.created_at), { 
    addSuffix: true,
    locale: he
  });

  // Get status information
  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case "new": return "bg-blue-500 hover:bg-blue-600";
      case "in_progress": return "bg-yellow-500 hover:bg-yellow-600";
      case "waiting": return "bg-purple-500 hover:bg-purple-600";
      case "closed": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "new": return "חדש";
      case "in_progress": return "בטיפול";
      case "waiting": return "בהמתנה";
      case "closed": return "סגור";
      default: return "לא ידוע";
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-md transition-all hover:shadow-lg">
      <CardHeader className="bg-slate-50 p-4 flex flex-row justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">{lead.name}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
            <Clock className="h-3.5 w-3.5 ml-1" />
            {formattedDate}
          </div>
        </div>
        
        <Badge className={`${getStatusBadgeColor(lead.status)}`}>
          {getStatusText(lead.status)}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {lead.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
              <span dir="ltr">{lead.phone}</span>
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
          )}
          
          {lead.source && (
            <div className="flex items-center">
              <span className="text-sm font-semibold ml-2">מקור:</span>
              <span>{lead.source}</span>
            </div>
          )}
          
          {lead.assigned_to && (
            <div className="flex items-center">
              <User className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>מטפל: {lead.profiles?.full_name || "לא ידוע"}</span>
            </div>
          )}
          
          {lead.cars && (
            <div className="flex items-center">
              <span className="text-sm font-semibold ml-2">רכב:</span>
              <span>{`${lead.cars.make} ${lead.cars.model} ${lead.cars.year}`}</span>
            </div>
          )}
          
          {lead.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm">{lead.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 p-3 flex justify-between gap-2">
        <div className="flex space-x-2 rtl:space-x-reverse">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  disabled={!lead.phone}
                  onClick={() => {
                    if (lead.phone) {
                      window.open(`tel:${lead.phone}`, '_blank');
                    }
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>התקשר</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {lead.cars && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled={!lead.phone}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
                      </DialogHeader>
                      <WhatsappTemplateSelector 
                        car={lead.cars} 
                        onClose={() => setIsWhatsappOpen(false)}
                        initialPhoneNumber={lead.phone || ""}
                      />
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>שלח בוואטסאפ</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {canManageLeads() && (
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 gap-1"
              >
                <Edit className="h-3.5 w-3.5" />
                ערוך
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px]">
              <SheetHeader>
                <SheetTitle>עריכת לקוח</SheetTitle>
              </SheetHeader>
              <EditLeadForm lead={lead} />
            </SheetContent>
          </Sheet>
        )}
      </CardFooter>
    </Card>
  );
}
