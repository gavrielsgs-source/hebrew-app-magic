
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlanCards } from "@/components/subscription/SubscriptionPlanCards";
import { PaymentInfo } from "@/components/subscription/PaymentInfo";
import { PaymentForm, PaymentFormValues } from "@/components/subscription/PaymentForm";
import { BillingToggle } from "@/components/subscription/BillingToggle";
import { TranzilaPaymentIframe } from "@/components/subscription/TranzilaPaymentIframe";
import { applyDiscount, addVat, getVatAmount } from "@/utils/discount-codes";

export default function UpgradeSubscription() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [tranzilaData, setTranzilaData] = useState<{
    thtk: string;
    supplier: string;
    customerInfo: PaymentFormValues;
    finalSum: number;
  } | null>(null);
  const { subscription, refreshSubscription } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const plans = [
    { id: "premium", name: "פרימיום", monthlyPrice: 199, yearlyPrice: 179, tier: "premium" },
    { id: "business", name: "ביזנס", monthlyPrice: 399, yearlyPrice: 349, tier: "business" },
    { id: "enterprise", name: "אנטרפרייז", monthlyPrice: 699, yearlyPrice: 619, tier: "enterprise" },
  ];

  const getSelectedPlanDetails = (planId: string) => {
    return plans.find(plan => plan.id === planId);
  };

  const handleDiscountApplied = (percent: number, code: string) => {
    setDiscountPercent(percent);
    setDiscountCode(code);
  };

  // Calculate the base sum before VAT (with discount replacing yearly discount if applicable)
  const getBaseSum = (planId: string) => {
    const plan = getSelectedPlanDetails(planId);
    if (!plan) return 0;

    if (discountPercent > 0 && isYearly) {
      // Discount replaces yearly discount: use monthlyPrice × 12 as base
      return applyDiscount(plan.monthlyPrice * 12, discountPercent);
    }

    return isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice;
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!selectedPlan) {
      toast.error("אנא בחר חבילה תחילה");
      return;
    }

    setLoading(true);
    
    try {
      const selectedPlanObj = getSelectedPlanDetails(selectedPlan);
      if (!selectedPlanObj) throw new Error("חבילה לא נמצאה");

      const baseSum = getBaseSum(selectedPlan);
      const actualSum = addVat(baseSum);

      const { data: handshakeData, error } = await supabase.functions.invoke('tranzila-handshake', {
        body: {
          sum: actualSum,
          planId: selectedPlan,
          billingCycle: isYearly ? 'yearly' : 'monthly',
          isYearly,
          discountCode: discountCode || undefined,
        }
      });

      if (error) {
        console.error("Handshake error:", error);
        throw new Error(error.message);
      }

      if (!handshakeData?.success || !handshakeData?.thtk) {
        console.error("Handshake failed:", handshakeData);
        throw new Error(handshakeData?.error || 'שגיאה באתחול תשלום');
      }

      setTranzilaData({
        thtk: handshakeData.thtk,
        supplier: handshakeData.supplier,
        customerInfo: data,
        finalSum: actualSum,
      });

    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("שגיאה בתהליך התשלום", {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setTranzilaData(null);
    setDiscountPercent(0);
    setDiscountCode("");
    setPaymentDrawerOpen(true);
  };

  const handleDrawerClose = (open: boolean) => {
    setPaymentDrawerOpen(open);
    if (!open) {
      setTranzilaData(null);
      setDiscountPercent(0);
      setDiscountCode("");
    }
  };

  const getOriginalYearlySum = () => {
    if (!selectedPlan) return 0;
    const plan = getSelectedPlanDetails(selectedPlan);
    if (!plan) return 0;
    return isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice;
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
                  {tranzilaData ? 'השלם תשלום' : 'פרטי תשלום'} - מנוי {getSelectedPlanDetails(selectedPlan)?.name}
                  {isYearly && " (תשלום שנתי)"}
                </>
              )}
            </DrawerTitle>
            {selectedPlan && (
              <div className="text-center text-sm mt-1 space-y-1">
                {discountPercent > 0 && (
                  <p>
                    <span className="line-through text-muted-foreground">₪{getSelectedPlanDetails(selectedPlan)!.monthlyPrice * 12}</span>
                    {' '}
                    <span className="text-green-600 font-bold">₪{getBaseSum(selectedPlan)}</span>
                    {' '}
                    <span className="text-green-600 text-xs">({discountPercent}% הנחה)</span>
                  </p>
                )}
                <p className="text-muted-foreground">
                  <span className="font-bold text-foreground">סה״כ: ₪{addVat(getBaseSum(selectedPlan))}</span>
                </p>
              </div>
            )}
          </DrawerHeader>
          
          <div className="px-4 overflow-y-auto">
            {tranzilaData && selectedPlan ? (
              <TranzilaPaymentIframe
                supplier={tranzilaData.supplier}
                thtk={tranzilaData.thtk}
                sum={tranzilaData.finalSum}
                recurSum={tranzilaData.finalSum}
                recurTransaction={isYearly ? '7_approved' : '4_approved'}
                customerInfo={{
                  contact: tranzilaData.customerInfo.fullName,
                  email: tranzilaData.customerInfo.email,
                  phone: tranzilaData.customerInfo.phone,
                  company: tranzilaData.customerInfo.companyName,
                  address: tranzilaData.customerInfo.address,
                  city: tranzilaData.customerInfo.city,
                }}
                planId={selectedPlan}
                billingCycle={isYearly ? 'yearly' : 'monthly'}
                userId={user?.id}
                productName={`מנוי ${getSelectedPlanDetails(selectedPlan)?.name} - CarsLead`}
              />
            ) : (
              <PaymentForm 
                onSubmit={onSubmit}
                loading={loading}
                onCancel={() => handleDrawerClose(false)}
                selectedPlan={selectedPlan}
                isYearly={isYearly}
                onDiscountApplied={handleDiscountApplied}
              />
            )}
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
