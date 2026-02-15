import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/subscription-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Crown,
  Shield,
  Clock,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";

export default function ManageSubscription() {
  const { subscription, isLoading, refreshSubscription, daysLeftInTrial } = useSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchPaymentHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchPaymentHistory();
    }
  }, [isLoading]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: {
          reason: cancelReason,
          feedback: cancelFeedback,
          immediateCancel: subscription?.subscription_status === "trial",
        },
      });
      if (error) throw error;
      toast.success(
        subscription?.subscription_status === "trial"
          ? "תקופת הניסיון בוטלה בהצלחה"
          : "המנוי יבוטל בסוף תקופת החיוב הנוכחית"
      );
      setCancelDialogOpen(false);
      await refreshSubscription();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast.error(error.message || "שגיאה בביטול המנוי");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = subscription?.subscription_status;
    switch (status) {
      case "trial":
        return <Badge className="bg-primary/10 text-primary border-primary/20">תקופת ניסיון</Badge>;
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">פעיל</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">מבוטל</Badge>;
      case "expired":
        return <Badge className="bg-muted text-muted-foreground">פג תוקף</Badge>;
      case "past_due":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">חיוב נכשל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      premium: "פרימיום",
      business: "ביזנס",
      enterprise: "אנטרפרייז",
    };
    return names[tier] || tier;
  };

  const subscriptionContent = (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-l from-primary to-primary/80 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="text-primary-foreground text-right">
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">ניהול מנוי</h1>
              <p className="text-primary-foreground/80 text-sm md:text-lg">
                נהל את המנוי והתשלומים שלך
              </p>
            </div>
            <div className="h-12 w-12 md:h-16 md:w-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Subscription */}
        <Card className="shadow-lg rounded-2xl border-2">
          <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-right text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                מנוי נוכחי
              </CardTitle>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground text-right">
              חבילת {getTierName(subscription?.tier || "")}
            </p>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            {subscription?.subscription_status === "trial" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    ימים שנותרו בניסיון
                  </span>
                  <span className="font-bold text-xl text-primary">
                    {daysLeftInTrial}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">תום תקופת ניסיון</span>
                  <span className="font-medium">
                    {subscription?.trialEndsAt
                      ? format(new Date(subscription.trialEndsAt), "PPP", { locale: he })
                      : "-"}
                  </span>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                  <p className="text-sm text-foreground">
                    💡 בסיום תקופת הניסיון יתבצע חיוב אוטומטי של{" "}
                    <span className="font-bold text-primary">₪{subscription?.billing_amount || 0}</span>
                    {" "}({subscription?.billing_cycle === "yearly" ? "שנתי" : "חודשי"})
                  </p>
                </div>
              </div>
            )}

            {subscription?.subscription_status === "active" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    חיוב הבא
                  </span>
                  <span className="font-medium">
                    {subscription?.next_billing_date
                      ? format(new Date(subscription.next_billing_date), "PPP", { locale: he })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    סכום חיוב
                  </span>
                  <span className="font-bold text-xl text-foreground">
                    ₪{subscription?.billing_amount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">מחזור תשלום</span>
                  <span className="font-medium">
                    {subscription?.billing_cycle === "yearly" ? "שנתי" : "חודשי"}
                  </span>
                </div>
              </div>
            )}

            {subscription?.cancel_at_period_end && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1 text-foreground">המנוי יבוטל בתאריך:</p>
                  <p className="text-muted-foreground">
                    {subscription?.next_billing_date
                      ? format(new Date(subscription.next_billing_date), "PPP", { locale: he })
                      : "-"}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                onClick={() => navigate("/subscription/upgrade")}
                disabled={subscription?.subscription_status === "cancelled"}
                className="w-full h-12 rounded-xl bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
              >
                <TrendingUp className="h-4 w-4 ml-2" />
                שדרג חבילה
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>

              {subscription?.subscription_status !== "cancelled" &&
                !subscription?.cancel_at_period_end && (
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="h-4 w-4 ml-2" />
                    בטל מנוי
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="shadow-lg rounded-2xl border-2">
          <CardHeader className="bg-gradient-to-l from-green-500/10 to-transparent border-b pb-4">
            <CardTitle className="text-right text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              אמצעי תשלום
            </CardTitle>
            <p className="text-sm text-muted-foreground text-right">
              פרטי התשלום שלך מאובטחים
            </p>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="bg-muted/50 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  כרטיס האשראי שלך מאובטח ומוצפן
                </p>
              </div>
              <p className="text-xs text-muted-foreground pr-6">
                פרטי כרטיס האשראי מנוהלים באמצעות Grow Payments
              </p>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-xl border-2" disabled>
              <CreditCard className="h-4 w-4 ml-2" />
              עדכן פרטי תשלום
              <span className="text-xs mr-2 text-muted-foreground">(בקרוב)</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="shadow-lg rounded-2xl border-2">
        <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b pb-4">
          <CardTitle className="text-right text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            היסטוריית תשלומים
          </CardTitle>
          <p className="text-sm text-muted-foreground text-right">רשימת התשלומים שבוצעו</p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">אין תשלומים עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border-2 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      payment.status === "success" 
                        ? "bg-green-500/10" 
                        : "bg-destructive/10"
                    }`}>
                      {payment.status === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.payment_type === "trial_verification"
                          ? "אימות כרטיס (החזר מיידי)"
                          : payment.payment_type === "yearly"
                          ? "חיוב שנתי"
                          : "חיוב חודשי"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), "PPP p", { locale: he })}
                      </p>
                      {payment.failure_reason && (
                        <p className="text-xs text-destructive mt-1">{payment.failure_reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-foreground">₪{payment.amount}</p>
                    {payment.asmachta && (
                      <p className="text-xs text-muted-foreground">#{payment.asmachta}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/subscription")}
        className="w-full h-12 rounded-xl border-2"
      >
        חזרה לעמוד המנוי
      </Button>
    </div>
  );

  // Cancel Dialog (shared between mobile/desktop)
  const cancelDialog = (
    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
      <DialogContent className="rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">בטל מנוי</DialogTitle>
          <DialogDescription className="text-right">
            {subscription?.subscription_status === "trial"
              ? "תקופת הניסיון שלך תבוטל מיידית ולא תחויב."
              : "המנוי יבוטל בסוף תקופת החיוב הנוכחית. תמשיך ליהנות מהשירות עד אז."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>למה אתה מבטל? (אופציונלי)</Label>
            <select
              className="w-full p-3 border-2 rounded-xl bg-background text-foreground text-right"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              <option value="">בחר סיבה...</option>
              <option value="too_expensive">יקר מדי</option>
              <option value="not_using">לא משתמש מספיק</option>
              <option value="missing_features">חסרות תכונות</option>
              <option value="switching">עובר לשירות אחר</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>משוב נוסף (אופציונלי)</Label>
            <Textarea
              placeholder="ספר לנו איך נוכל להשתפר..."
              value={cancelFeedback}
              onChange={(e) => setCancelFeedback(e.target.value)}
              rows={3}
              className="rounded-xl border-2 text-right"
            />
          </div>
        </div>

        <DialogFooter className="flex-row-reverse gap-2">
          <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="rounded-xl">
            חזור
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={isCancelling}
            className="rounded-xl"
          >
            {isCancelling ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מבטל...
              </>
            ) : (
              "אשר ביטול"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isMobile) {
    return (
      <MobileContainer className="bg-background" withPadding={false}>
        <div className="p-4 pb-24">
          {subscriptionContent}
        </div>
        {cancelDialog}
      </MobileContainer>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {subscriptionContent}
      </div>
      {cancelDialog}
    </div>
  );
}
