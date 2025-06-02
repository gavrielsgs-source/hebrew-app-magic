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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { MobileAddLeadForm } from "@/components/leads/MobileAddLeadForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Leads() {
  const { toast } = useToast();
  const { checkEntitlement } = useSubscription();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("leads");
  const isMobile = useIsMobile();
  
  console.log('Leads page - isMobile:', isMobile);
  
  // Initialize leads hook
  const { leads = [], isLoading, error } = useLeads();

  const canAddLead = checkEntitlement('leadLimit', leads.length + 1);

  const onLeadAdded = () => {
    console.log('Lead added successfully');
    setIsAddingLead(false);
    setShowAddDialog(false);
    toast({
      title: "ליד נוסף",
      description: "הליד נוסף בהצלחה!",
    });
  };

  const handleAddLead = () => {
    console.log("Add lead clicked - simplified handler", { canAddLead, isMobile });
    
    if (!canAddLead) {
      toast({
        title: "הגעת למגבלת המנוי",
        description: "לא ניתן להוסיף עוד לקוחות. אנא שדרג את המנוי שלך.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingLead(true);
    setShowAddDialog(true);
  };

  const handleWhatsApp = () => {
    console.log("WhatsApp clicked");
    try {
      window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      window.location.href = 'https://web.whatsapp.com';
    }
  };

  const handleScheduleMeeting = () => {
    console.log("Schedule meeting clicked");
  };

  // Error state
  if (error) {
    return (
      <MobileContainer>
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center" dir="rtl">
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

  // Mobile view - simplified dialog management
  if (isMobile) {
    return (
      <MobileContainer withPadding={false}>
        <SubscriptionLimitAlert 
          featureKey="leadLimit" 
          currentCount={leads.length} 
          entityName="לקוחות" 
        />
        
        <LeadsMobileHeader
          onAddLead={handleAddLead}
          onWhatsApp={handleWhatsApp}
          leadsCount={leads.length}
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

        {/* Simple Add Lead Dialog for Mobile */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">הוסף לקוח חדש</DialogTitle>
            </DialogHeader>
            
            {!canAddLead ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 text-right">
                  הגעת למגבלת המנוי. לא ניתן להוסיף עוד לקוחות. אנא שדרג את המנוי שלך.
                </AlertDescription>
              </Alert>
            ) : (
              <MobileAddLeadForm onSuccess={onLeadAdded} />
            )}
          </DialogContent>
        </Dialog>
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
