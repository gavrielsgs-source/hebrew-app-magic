
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlanCards } from "@/components/subscription/SubscriptionPlanCards";
import { PaymentInfo } from "@/components/subscription/PaymentInfo";
import { PaymentForm, PaymentFormValues } from "@/components/subscription/PaymentForm";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get('plan');
  
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(preselectedPlan);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const onSubmit = async (data: PaymentFormValues) => {
    if (!selectedPlan) {
      toast.error("אנא בחר חבילה תחילה");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Start payment process!");
      const selectedPlanObj = getSelectedPlanDetails(selectedPlan);
      if (!selectedPlanObj) {
        throw new Error("חבילה לא נמצאה");
      }

      // Prepare payment parameters with proper types
      const paymentPayload = {
        sum: selectedPlanObj.priceValue,
        fullName: data.fullName,
        phone: data.phone,
      };

      console.log("Sending payment payload:", paymentPayload);

      // Send request to create payment
      const { data: paymentData, error } = await supabase.functions.invoke('grow-payment', {
        body: {
          action: 'createPaymentProcess',
          payload: paymentPayload
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      console.log("Payment response:", paymentData);

      // Check for errors in response
      if (paymentData.error) {
        console.error("Payment API error:", paymentData);
        const errorMessage = typeof paymentData.error === 'string' 
          ? paymentData.error 
          : (paymentData.details?.message || 'שגיאה לא ידועה');
        throw new Error(errorMessage);
      }

      // Handle successful response
      if (paymentData.success) {
        // If redirect URL exists, redirect user
        if (paymentData.url || paymentData.redirectUrl) {
          const redirectUrl = paymentData.url || paymentData.redirectUrl;
          console.log("Redirecting to payment URL:", redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.error("Missing redirect URL in response:", paymentData);
          throw new Error('לא התקבלה כתובת הפניה לתשלום');
        }
      } else {
        throw new Error('לא התקבלה תשובה תקינה משרת התשלומים');
      }
      
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("שגיאה בתהליך התשלום", {
        description: error instanceof Error ? error.message : String(error)
      });
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setPaymentDrawerOpen(true);
  };
  
  const getSelectedPlanDetails = (planId: string) => {
    const plans = [
      {
        id: "premium",
        name: "פרימיום",
        priceValue: 199,
        tier: "premium"
      },
      {
        id: "business",
        name: "ביזנס",
        priceValue: 349,
        tier: "business"
      },
      {
        id: "enterprise",
        name: "אנטרפרייז",
        priceValue: 599,
        tier: "enterprise"
      }
    ];
    
    return plans.find(plan => plan.id === planId);
  };

  return (
    <div className={`container mx-auto py-10 px-4 ${isMobile ? 'pb-24' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} mb-8`}>
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>בחר את החבילה שלך</h1>
          <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-sm' : ''}`}>
            14 ימי ניסיון חינם - ללא כרטיס אשראי!
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className={isMobile ? 'self-start' : ''}
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה לדף הבית
        </Button>
      </div>

      <SubscriptionPlanCards 
        selectedPlan={selectedPlan} 
        setSelectedPlan={setSelectedPlan}
        handleUpgrade={handleUpgrade}
        loading={loading}
      />

      <PaymentInfo />

      <Drawer open={paymentDrawerOpen} onOpenChange={setPaymentDrawerOpen}>
        <DrawerContent className={`max-h-[96%] ${isMobile ? 'h-[90vh]' : ''}`}>
          <DrawerHeader>
            <DrawerTitle className={`text-center ${isMobile ? 'text-base' : 'text-lg'}`}>
              {selectedPlan && (
                <>פרטי תשלום - מנוי {getSelectedPlanDetails(selectedPlan)?.name}</>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 overflow-y-auto">
            <PaymentForm 
              onSubmit={onSubmit}
              loading={loading}
              onCancel={() => setPaymentDrawerOpen(false)}
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
