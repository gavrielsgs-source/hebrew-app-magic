
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
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileHeader } from "@/components/mobile/MobileHeader";

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
      <MobileContainer>
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-3">שגיאה בטעינת דף הלידים</h2>
          <p className="text-red-600 mb-6 text-base">
            אירעה שגיאה בטעינת דף הלידים: {error.message || 'שגיאה לא מוכרת'}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-red-600 text-white px-6 py-4 rounded-2xl hover:bg-red-700 font-semibold text-lg"
            >
              רענן דף
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 font-semibold text-lg"
            >
              חזור לדשבורד
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <div className="text-xl font-semibold">טוען לידים...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <MobileContainer withPadding={false}>
        <SubscriptionLimitAlert 
          featureKey="leadLimit" 
          currentCount={leads.length} 
          entityName="לקוחות" 
        />
        
        <MobileHeader 
          title="ניהול לידים"
          subtitle={`${leads.length} לקוחות פוטנציאליים`}
        />

        <div className="px-4">
          <LeadsPageTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            leads={leads}
            isLoading={isLoading}
            error={error}
            isMobile={true}
          />
        </div>
      </MobileContainer>
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
