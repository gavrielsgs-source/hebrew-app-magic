
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacebookLeadIntegration } from "../FacebookLeadIntegration";
import { LeadsContent } from "./LeadsContent";
import { LeadsMobileContent } from "./LeadsMobileContent";

interface LeadsPageTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leads: any[];
  isLoading: boolean;
  error?: Error | null;
  isMobile: boolean;
}

export function LeadsPageTabs({
  activeTab,
  setActiveTab,
  leads,
  isLoading,
  error,
  isMobile
}: LeadsPageTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className={`w-full ${isMobile ? 'px-4' : ''}`}>
      <TabsList className="mb-6">
        <TabsTrigger value="leads">לידים</TabsTrigger>
        <TabsTrigger value="settings">אינטגרציות</TabsTrigger>
      </TabsList>
      
      <TabsContent value="leads" className="mt-0">
        {isMobile ? (
          <LeadsMobileContent leads={leads} isLoading={isLoading} error={error} />
        ) : (
          <LeadsContent leads={leads} isLoading={isLoading} error={error} />
        )}
      </TabsContent>
      
      <TabsContent value="settings" className="mt-0">
        <FacebookLeadIntegration />
      </TabsContent>
    </Tabs>
  );
}
