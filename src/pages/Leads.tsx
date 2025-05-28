
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
  const { checkEntitlement } = useSubscription();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("leads");
  const isMobile = useIsMobile();
  
  // Initialize leads hook with error handling
  let leads, isLoading, error;
  try {
    const leadsData = useLeads();
    leads = leadsData.leads || [];
    isLoading = leadsData.isLoading;
    error = leadsData.error;
  } catch (hookError) {
    console.error('Error in useLeads hook:', hookError);
    leads = [];
    isLoading = false;
    error = hookError;
  }

  const canAddLead = checkEntitlement('leadLimit', leads.length + 1);

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

  // Error boundary fallback
  if (error) {
    console.error('Leads page error:', error);
    return (
      <div className="p-4 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בטעינת הדף</h2>
          <p className="text-red-600 mb-4">אירעה שגיאה בטעינת דף הלידים</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            רענן דף
          </button>
        </div>
      </div>
    );
  }

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
