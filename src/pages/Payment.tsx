import { useState, useEffect } from "react";
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
import { BillingToggle } from "@/components/subscription/BillingToggle";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(preselectedPlan);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userFullName, setUserFullName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [userCompanyName, setUserCompanyName] = useState<string>("");
  const [userBusinessId, setUserBusinessId] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [userCity, setUserCity] = useState<string>("");
  const [userPostalCode, setUserPostalCode] = useState<string>("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");

        // Get user metadata from auth
        const metadata = user.user_metadata || {};

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, company_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserFullName(profile.full_name || metadata.full_name || "");
          setUserPhone(profile.phone || metadata.phone || "");
          setUserCompanyName(profile.company_name || metadata.company_name || "");
        }

        // Try to get business details from user metadata
        setUserBusinessId(metadata.business_id || "");
        setUserAddress(metadata.address || "");
        setUserCity(metadata.city || "");
        setUserPostalCode(metadata.postal_code || "");
      }
    };

    fetchUserData();
  }, []);

  const onSubmit = async (data: PaymentFormValues) => {
    if (!selectedPlan) {
      toast.error("אנא בחר חבילה תחילה");
      return;
    }

    if (!userEmail) {
      toast.error("חובה להיות מחובר כדי להמשיך");
      return;
    }

    setLoading(true);

    try {
      console.log("Start payment process!");
      const selectedPlanObj = getSelectedPlanDetails(selectedPlan);
      if (!selectedPlanObj) {
        throw new Error("חבילה לא נמצאה");
      }

      const actualSum = isYearly ? selectedPlanObj.yearlyPrice * 12 : selectedPlanObj.monthlyPrice;

      console.log(data);
      const paymentPayload = {
        sum: actualSum,
        fullName: data.fullName,
        phone: data.phone,
        userEmail,
        email: data.email,
        planId: selectedPlan,
        isTrial: true,
        billingCycle: isYearly ? "yearly" : "monthly",
        companyName: data.companyName,
        businessId: data.businessId,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
      };

      console.log("Sending payment payload:", paymentPayload);

      const { data: paymentData, error } = await supabase.functions.invoke("grow-payment", {
        body: {
          action: "createPaymentProcess",
          payload: paymentPayload,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      console.log("Payment response:", paymentData);

      if (paymentData.error) {
        console.error("Payment API error:", paymentData);
        const errorMessage =
          typeof paymentData.error === "string" ? paymentData.error : paymentData.details?.message || "שגיאה לא ידועה";
        throw new Error(errorMessage);
      }

      if (paymentData.success) {
        if (paymentData.url || paymentData.redirectUrl) {
          const redirectUrl = paymentData.url || paymentData.redirectUrl;
          console.log("Redirecting to payment URL:", redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.error("Missing redirect URL in response:", paymentData);
          throw new Error("לא התקבלה כתובת הפניה לתשלום");
        }
      } else {
        throw new Error("לא התקבלה תשובה תקינה משרת התשלומים");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("שגיאה בתהליך התשלום", {
        description: error instanceof Error ? error.message : String(error),
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
        monthlyPrice: 199,
        yearlyPrice: 179,
        tier: "premium",
      },
      {
        id: "business",
        name: "ביזנס",
        monthlyPrice: 399,
        yearlyPrice: 349,
        tier: "business",
      },
      {
        id: "enterprise",
        name: "אנטרפרייז",
        monthlyPrice: 699,
        yearlyPrice: 619,
        tier: "enterprise",
      },
    ];

    return plans.find((plan) => plan.id === planId);
  };

  return (
    <div className={`container mx-auto py-10 px-4 ${isMobile ? "pb-24" : ""}`}>
      <div className={`flex ${isMobile ? "flex-col space-y-4" : "justify-between items-center"} mb-8`}>
        <div>
          <h1 className={`font-bold ${isMobile ? "text-2xl" : "text-3xl"}`}>בחר את החבילה שלך</h1>
          <p className={`text-muted-foreground mt-2 ${isMobile ? "text-sm" : ""}`}>
            14 ימי ניסיון חינם - ללא כרטיס אשראי!
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")} className={isMobile ? "self-start" : ""}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה לדף הבית
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

      <Drawer open={paymentDrawerOpen} onOpenChange={setPaymentDrawerOpen}>
        <DrawerContent className={`max-h-[96%] ${isMobile ? "h-[90vh]" : ""}`}>
          <DrawerHeader>
            <DrawerTitle className={`text-center ${isMobile ? "text-base" : "text-lg"}`}>
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
              onCancel={() => setPaymentDrawerOpen(false)}
              selectedPlan={selectedPlan}
              initialValues={{
                fullName: userFullName,
                phone: userPhone,
                companyName: userCompanyName,
                businessId: userBusinessId,
                address: userAddress,
                city: userCity,
                postalCode: userPostalCode,
              }}
            />
          </div>

          <DrawerFooter className="pt-2">
            <p className={`text-center text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
              התשלום מאובטח ומוצפן בתקן PCI DSS
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
