
import { useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LeadsPageHeader } from "@/components/leads/page/LeadsPageHeader";
import { LeadsMobileHeader } from "@/components/leads/page/LeadsMobileHeader";
import { LeadsPageTabs } from "@/components/leads/page/LeadsPageTabs";

export default function Leads() {
  console.log('Leads page rendered');
  
  const { toast } = useToast();
  const { leads, isLoading, error } = useLeads();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const { checkEntitlement } = useSubscription();
  const canAddLead = checkEntitlement('leadLimit', leads.length + 1);
  const [activeTab, setActiveTab] = useState<string>("leads");
  const isMobile = useIsMobile();

  console.log('Leads page state:', { 
    leadsCount: leads?.length, 
    isLoading, 
    error: error?.message, 
    isMobile,
    activeTab,
    canAddLead
  });

  const onLeadAdded = () => {
    console.log("Lead added successfully, closing dialog");
    setIsAddingLead(false);
    toast({
      title: "ליד נוסף",
      description: "הליד נוסף בהצלחה!",
    });
  };

  // Mobile view with header
  if (isMobile) {
    console.log('Mobile view - rendering with header and LeadsMobileView');
    return (
      <div className="mobile-content pb-24" dir="rtl">
        <SubscriptionLimitAlert 
          featureKey="leadLimit" 
          currentCount={leads.length} 
          entityName="לקוחות" 
        />
        
        <LeadsMobileHeader
          isAddingLead={isAddingLead}
          setIsAddingLead={setIsAddingLead}
          canAddLead={canAddLead}
          onLeadAdded={onLeadAdded}
          setActiveTab={setActiveTab}
        />

        <LeadsPageTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          leads={leads}
          isLoading={isLoading}
          error={error}
          isMobile={true}
        />
      </div>
    );
  }

  return (
    <div className={cn("p-4 sm:p-6 rtl-fix", isMobile && "pb-24")}>
      <SubscriptionLimitAlert 
        featureKey="leadLimit" 
        currentCount={leads.length} 
        entityName="לקוחות" 
      />
      
      <LeadsPageHeader
        isAddingLead={isAddingLead}
        setIsAddingLead={setIsAddingLead}
        canAddLead={canAddLead}
        onLeadAdded={onLeadAdded}
        setActiveTab={setActiveTab}
      />

      <LeadsPageTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leads={leads}
        isLoading={isLoading}
        error={error}
        isMobile={false}
      />
    </div>
  );
}
