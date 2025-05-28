
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
  const { toast } = useToast();
  const { checkEntitlement } = useSubscription();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("leads");
  const isMobile = useIsMobile();
  
  // Initialize leads hook
  const { leads = [], isLoading, error } = useLeads();

  const canAddLead = checkEntitlement('leadLimit', leads.length + 1);

  const onLeadAdded = () => {
    setIsAddingLead(false);
    toast({
      title: "ליד נוסף",
      description: "הליד נוסף בהצלחה!",
    });
  };

  // Error state
  if (error) {
    return (
      <div className="p-4 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בטעינת דף הלידים</h2>
          <p className="text-red-600 mb-4">
            אירעה שגיאה בטעינת דף הלידים: {error.message || 'שגיאה לא מוכרת'}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mr-2"
            >
              רענן דף
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              חזור לדשבורד
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">טוען לידים...</div>
        </div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
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

  // Desktop view
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
