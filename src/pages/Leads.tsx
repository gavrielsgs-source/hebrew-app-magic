
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
  console.log('📄 Leads page component starting to render');
  
  const { toast } = useToast();
  const { checkEntitlement } = useSubscription();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("leads");
  const isMobile = useIsMobile();
  
  console.log('📄 Leads page state initialized:', { 
    isMobile, 
    activeTab, 
    isAddingLead 
  });

  // Initialize leads hook with comprehensive error handling
  let leads, isLoading, error;
  try {
    console.log('🎣 Attempting to initialize useLeads hook...');
    const leadsData = useLeads();
    leads = leadsData.leads || [];
    isLoading = leadsData.isLoading;
    error = leadsData.error;
    console.log('✅ useLeads hook initialized successfully:', { 
      leadsCount: leads.length, 
      isLoading, 
      hasError: !!error 
    });
  } catch (hookError) {
    console.error('❌ Critical error in useLeads hook:', hookError);
    leads = [];
    isLoading = false;
    error = hookError;
  }

  let canAddLead = false;
  try {
    canAddLead = checkEntitlement('leadLimit', leads.length + 1);
    console.log('🔒 Lead entitlement checked:', { canAddLead, currentCount: leads.length });
  } catch (entitlementError) {
    console.error('❌ Error checking lead entitlement:', entitlementError);
    canAddLead = false;
  }

  const onLeadAdded = () => {
    console.log("✅ Lead added successfully, closing dialog");
    setIsAddingLead(false);
    toast({
      title: "ליד נוסף",
      description: "הליד נוסף בהצלחה!",
    });
  };

  console.log('📄 Leads page rendering with:', { 
    leadsCount: leads?.length, 
    isLoading, 
    error: error?.message, 
    isMobile,
    activeTab,
    canAddLead
  });

  // Error boundary fallback
  if (error) {
    console.error('❌ Leads page error state:', error);
    return (
      <div className="p-4 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בטעינת דף הלידים</h2>
          <p className="text-red-600 mb-4">
            אירעה שגיאה בטעינת דף הלידים: {error.message || 'שגיאה לא מוכרת'}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                console.log('🔄 User clicked refresh page from error state');
                window.location.reload();
              }} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mr-2"
            >
              רענן דף
            </button>
            <button 
              onClick={() => {
                console.log('🏠 User clicked back to dashboard from error state');
                window.location.href = '/dashboard';
              }} 
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
    console.log('⏳ Leads page showing loading state');
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">טוען לידים...</div>
        </div>
      </div>
    );
  }

  try {
    // Mobile view with header
    if (isMobile) {
      console.log('📱 Rendering mobile view');
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
    console.log('🖥️ Rendering desktop view');
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
  } catch (renderError) {
    console.error('❌ Error during Leads page render:', renderError);
    return (
      <div className="p-4 text-center" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בהצגת הדף</h2>
          <p className="text-red-600 mb-4">אירעה שגיאה בהצגת תוכן הדף</p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                console.log('🔄 User clicked refresh from render error');
                window.location.reload();
              }} 
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              רענן דף
            </button>
            <button 
              onClick={() => {
                console.log('🏠 User clicked back to dashboard from render error');
                window.location.href = '/dashboard';
              }} 
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              חזור לדשבורד
            </button>
          </div>
        </div>
      </div>
    );
  }
}
