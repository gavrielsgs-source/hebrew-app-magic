
import { useState } from "react";
import { LeadsGrid } from "@/components/leads/LeadsGrid";
import { LeadsMobileView } from "@/components/leads/LeadsMobileView";
import { LeadsTable } from "@/components/LeadsTable";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Settings, Grid, Table as TableIcon } from "lucide-react";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacebookLeadIntegration } from "@/components/leads/FacebookLeadIntegration";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { Input } from "@/components/ui/input";

export default function Leads() {
  const { toast } = useToast();
  const { leads, isLoading, error } = useLeads();
  const addLead = useCreateLead();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const { checkEntitlement } = useSubscription();
  const canAddLead = checkEntitlement('leadLimit', leads.length + 1);
  const [activeTab, setActiveTab] = useState<string>("leads");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const onLeadAdded = () => {
    toast({
      title: "ליד נוסף",
      description: "הליד נוסף בהצלחה!",
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <SubscriptionLimitAlert 
        featureKey="leadLimit" 
        currentCount={leads.length} 
        entityName="לקוחות" 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">לקוחות פוטנציאליים</h1>
          <p className="text-muted-foreground mt-1">
            ניהול ומעקב אחר לידים פוטנציאליים
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
          {isMobile && (
            <NotificationsPopover />
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4 ml-1.5" />
            הגדרות
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                size="sm" 
                className={`flex items-center gap-2 ${isMobile ? "flex-1" : ""}`}
                disabled={!canAddLead}
              >
                <Plus className="h-4 w-4 ml-1.5" />
                לקוח חדש
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>הוסף לקוח חדש</SheetTitle>
              </SheetHeader>
              <AddLeadForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="leads">לידים</TabsTrigger>
          <TabsTrigger value="settings">אינטגרציות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="mt-0">
          {activeTab === "leads" && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"} 
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "table" ? "default" : "outline"} 
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full max-w-xs">
                <Input 
                  placeholder="חיפוש לקוחות..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {isMobile ? (
            <LeadsMobileView leads={leads} isLoading={isLoading} error={error} />
          ) : viewMode === "grid" ? (
            <LeadsGrid leads={leads} isLoading={isLoading} error={error} />
          ) : (
            <LeadsTable searchTerm={searchTerm} />
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <FacebookLeadIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
