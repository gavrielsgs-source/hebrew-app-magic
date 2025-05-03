
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Phone, MessageSquare, Calendar, Edit, Send } from "lucide-react";
import { EditLeadForm } from "./EditLeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { getStatusBadgeColor, getStatusText } from "./grid/utils/lead-status";
import { LeadReminders } from "./grid/LeadReminders";

export function LeadsMobileView({ leads, isLoading, error }: { leads: any[]; isLoading: boolean; error?: Error | null }) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "reminders">("details");
  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  
  const selectedLead = selectedLeadId 
    ? leads.find(lead => lead.id === selectedLeadId) 
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md" dir="rtl">
        <p className="font-semibold">שגיאה בטעינת הלקוחות</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center" dir="rtl">
        <div className="bg-slate-100 rounded-full p-3 mb-3">
          <MessageSquare className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="font-medium text-lg mb-1">אין לקוחות פוטנציאליים</h3>
        <p className="text-slate-500 text-sm mb-4">הוסף את הלקוח הראשון שלך להתחיל</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {leads.map((lead) => (
        <Card key={lead.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <div className="font-semibold text-lg">{lead.name}</div>
              <Badge className={`mt-1 ${getStatusBadgeColor(lead.status)}`}>
                {getStatusText(lead.status)}
              </Badge>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    setActiveTab("details");
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md" dir="rtl">
                <SheetHeader>
                  <SheetTitle>
                    {selectedLead?.name || "פרטי לקוח"}
                  </SheetTitle>
                </SheetHeader>
                
                {selectedLead && (
                  <div className="mt-6">
                    <div className="flex space-x-1 rtl:space-x-reverse mb-4">
                      <Button 
                        variant={activeTab === "details" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("details")}
                        className="flex-1"
                      >
                        פרטים
                      </Button>
                      <Button 
                        variant={activeTab === "reminders" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("reminders")}
                        className="flex-1"
                      >
                        תזכורות
                      </Button>
                    </div>
                    
                    {activeTab === "details" ? (
                      <EditLeadForm lead={selectedLead} />
                    ) : (
                      <LeadReminders lead={selectedLead} canAddReminder={true} />
                    )}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="space-y-2">
              {lead.phone && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 ml-2 text-slate-400" />
                    <span dir="ltr">{lead.phone}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {lead.email && (
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 ml-2 text-slate-400" />
                  <span className="text-sm truncate max-w-[200px]">{lead.email}</span>
                </div>
              )}
              
              {lead.source && (
                <div className="flex items-center">
                  <span className="text-sm ml-2 font-medium">מקור:</span>
                  <span className="text-sm">{lead.source}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 justify-end">
              <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!lead.cars}
                  >
                    <Send className="h-3.5 w-3.5 ml-1.5" />
                    שלח הצעה
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
                  </DialogHeader>
                  {lead.cars && (
                    <WhatsappTemplateSelector 
                      car={lead.cars} 
                      initialPhoneNumber={lead.phone || ""}
                      onClose={() => setIsWhatsappDialogOpen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setActiveTab("reminders");
                    }}
                  >
                    <Calendar className="h-3.5 w-3.5 ml-1.5" />
                    תזכורות
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md" dir="rtl">
                  <SheetHeader>
                    <SheetTitle>תזכורות עבור {lead.name}</SheetTitle>
                  </SheetHeader>
                  {selectedLead && (
                    <div className="mt-6">
                      <LeadReminders lead={selectedLead} canAddReminder={true} />
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
