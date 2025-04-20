import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Send, Edit, MessageSquare, Calendar, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EditLeadForm } from "@/components/leads/EditLeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { AddLeadForm } from "./AddLeadForm";
import type { Car } from "@/types/car";

interface LeadsGridProps {
  leads: any[];
  isLoading: boolean;
}

export function LeadsGrid({ leads, isLoading }: LeadsGridProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  
  const selectedLead = selectedLeadId 
    ? leads.find(lead => lead.id === selectedLeadId) 
    : null;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 w-full justify-between">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (leads.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/30">
        <h3 className="text-lg font-medium mb-2">אין לקוחות להצגה</h3>
        <p className="text-muted-foreground mb-4">
          הוסף לקוחות חדשים כדי לראות אותם כאן
        </p>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> הוסף לקוח
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]">
            <SheetHeader>
              <SheetTitle>הוסף לקוח חדש</SheetTitle>
            </SheetHeader>
            <AddLeadForm />
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map((lead) => (
        <Card key={lead.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                        setSelectedCar(lead.cars);
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
                  {selectedCar && (
                    <WhatsappTemplateSelector 
                      car={selectedCar} 
                      onClose={() => setIsWhatsappOpen(false)}
                      initialPhoneNumber={lead.phone || ""}
                    />
                  )}
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="ghost"
                size="icon"
              >
                <Calendar className="h-4 w-4" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px]">
                  <SheetHeader>
                    <SheetTitle>עריכת פרטי לקוח</SheetTitle>
                  </SheetHeader>
                  {selectedLead && <EditLeadForm lead={selectedLead} />}
                </SheetContent>
              </Sheet>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
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
