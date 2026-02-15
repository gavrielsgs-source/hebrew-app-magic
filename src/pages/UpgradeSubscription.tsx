
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { SubscriptionPlanCards } from "@/components/subscription/SubscriptionPlanCards";
import { PaymentInfo } from "@/components/subscription/PaymentInfo";
import { PaymentForm, PaymentFormValues } from "@/components/subscription/PaymentForm";
import { BillingToggle } from "@/components/subscription/BillingToggle";

export default function UpgradeSubscription() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const getSelectedPlanDetails = (planId: string) => {
    const plans = [
      { id: "premium", name: "פרימיום", monthlyPrice: 199, yearlyPrice: 179, tier: "premium" },
      { id: "business", name: "ביזנס", monthlyPrice: 399, yearlyPrice: 349, tier: "business" },
      { id: "enterprise", name: "אנטרפרייז", monthlyPrice: 699, yearlyPrice: 619, tier: "enterprise" },
    ];
    return plans.find(plan => plan.id === planId);
  };

  const onSubmit = async (data: PaymentFormValues) => {
    toast.error("מערכת התשלומים אינה פעילה כרגע");
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setPaymentDrawerOpen(true);
  };

  const handleDrawerClose = (open: boolean) => {
    setPaymentDrawerOpen(open);
  };

  return (
    <div className={`container mx-auto py-10 px-4 ${isMobile ? 'pb-24' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} mb-8`}>
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>שדרוג מנוי</h1>
          <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-sm' : ''}`}>
            בחר את החבילה המתאימה לצרכים שלך
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/subscription")}
          className={isMobile ? 'self-start' : ''}
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה לניהול מנוי
        </Button>
      </div>

      <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />

      <SubscriptionPlanCards 
        selectedPlan={selectedPlan} 
        setSelectedPlan={setSelectedPlan}
        handleUpgrade={handleUpgrade}
        loading={loading}
        isYearly={isYearly}
      />

      <PaymentInfo />

      <Drawer open={paymentDrawerOpen} onOpenChange={handleDrawerClose}>
        <DrawerContent className={`max-h-[96%] ${isMobile ? 'h-[90vh]' : ''}`}>
          <DrawerHeader>
            <DrawerTitle className={`text-center ${isMobile ? 'text-base' : 'text-lg'}`}>
              {selectedPlan && (
                <>
                  פרטי תשלום - מנוי {getSelectedPlanDetails(selectedPlan)?.name}
                  {isYearly && " (תשלום שנתי)"}
                </>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 overflow-y-auto">
            <PaymentForm 
              onSubmit={onSubmit}
              loading={loading}
              onCancel={() => handleDrawerClose(false)}
              selectedPlan={selectedPlan}
            />
          </div>
          
          <DrawerFooter className="pt-2">
            <p className={`text-center text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              התשלום מאובטח ומוצפן בתקן PCI DSS
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
