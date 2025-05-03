
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { supabase } from "@/lib/supabase";
import { SubscriptionPlanCards } from "@/components/subscription/SubscriptionPlanCards";
import { PaymentInfo } from "@/components/subscription/PaymentInfo";
import { PaymentForm, PaymentFormValues } from "@/components/subscription/PaymentForm";

export default function UpgradeSubscription() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  
  const onSubmit = async (data: PaymentFormValues) => {
    if (!selectedPlan) {
      toast.error("אנא בחר חבילה תחילה");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Start upgrade planning!");
      const selectedPlanObj = getSelectedPlanDetails(selectedPlan);
      if (!selectedPlanObj) {
        throw new Error("חבילה לא נמצאה");
      }

      // Prepare payment parameters with proper types
      const paymentPayload = {
        userId: data.userId,
        transactionToken: data.transactionToken,
        transactionId: data.transactionId,
        asmachta: data.asmachta,
        sum: selectedPlanObj.priceValue,
        // Add other fields for user identification
        customerName: data.fullName,
        customerPhone: data.phone,
        customerEmail: data.email || undefined,
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

  const updateRecurringPayment = async (params: {
    userId: string;
    transactionToken: string;
    transactionId: string;
    asmachta: string;
    fullName?: string;
    phone?: string;
    email?: string;
  }) => {
    try {
      console.log("Updating recurring payment:", params);
      
      const { data: updateResponse, error } = await supabase.functions.invoke('grow-payment', {
        body: {
          action: 'updateDirectDebit',
          payload: {
            userId: params.userId,
            transactionToken: params.transactionToken,
            transactionId: params.transactionId,
            asmachta: params.asmachta,
            customerName: params.fullName,
            customerPhone: params.phone,
            customerEmail: params.email,
          }
        }
      });

      if (error) {
        console.error("Error updating recurring payment:", error);
        return { success: false, error: error.message };
      }

      console.log("Update response:", updateResponse);
      
      if (updateResponse.error) {
        return { 
          success: false, 
          error: typeof updateResponse.error === 'string' ? 
            updateResponse.error : 
            updateResponse.details?.message || 'Unknown error' 
        };
      }

      return { success: true, data: updateResponse };
    } catch (error) {
      console.error("Exception updating recurring payment:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setPaymentDrawerOpen(true);
  };

  const handleMockSuccess = (planId: string) => {
    setLoading(true);
    setTimeout(() => {
      toast.success(`שדרוג לחבילת ${planId} בוצע בהצלחה!`, {
        description: "המערכת תתעדכן בקרוב עם הפרמטרים החדשים."
      });
      setLoading(false);
      refreshSubscription();
      navigate("/subscription");
    }, 1500);
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
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">שדרוג מנוי</h1>
          <p className="text-muted-foreground mt-2">בחר את החבילה המתאימה לצרכים שלך</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscription")}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה לניהול מנוי
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
        <DrawerContent className="max-h-[96%]">
          <DrawerHeader>
            <DrawerTitle className="text-center text-lg">
              {selectedPlan && (
                <>פרטי תשלום - מנוי {getSelectedPlanDetails(selectedPlan)?.name}</>
              )}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4">
            <PaymentForm 
              onSubmit={onSubmit}
              loading={loading}
              onCancel={() => setPaymentDrawerOpen(false)}
              selectedPlan={selectedPlan}
              onMockSuccess={handleMockSuccess}
            />
          </div>
          
          <DrawerFooter className="pt-2">
            <p className="text-sm text-center text-muted-foreground">
              התשלום מאובטח ומוצפן בתקן PCI DSS
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
