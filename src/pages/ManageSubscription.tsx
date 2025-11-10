import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/subscription-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function ManageSubscription() {
  const { subscription, isLoading, refreshSubscription, daysLeftInTrial } = useSubscription();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const navigate = useNavigate();

  // Fetch payment history
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

  // Load payment history on mount
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = subscription?.subscription_status;
    switch (status) {
      case "trial":
        return <Badge variant="secondary">תקופת ניסיון</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-600">פעיל</Badge>;
      case "cancelled":
        return <Badge variant="destructive">מבוטל</Badge>;
      case "expired":
        return <Badge variant="outline">פג תוקף</Badge>;
      case "past_due":
        return <Badge variant="destructive">חיוב נכשל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      premium: "Premium",
      business: "Business",
      enterprise: "Enterprise",
    };
    return names[tier] || tier;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ניהול מנוי</h1>
        <p className="text-muted-foreground">נהל את המנוי והתשלומים שלך</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>מנוי נוכחי</span>
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>פרטי החבילה הנוכחית שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">חבילה</span>
                <span className="font-medium text-lg">
                  {getTierName(subscription?.tier || "")}
                </span>
              </div>

              <Separator />

              {subscription?.subscription_status === "trial" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ימים שנותרו בניסיון</span>
                    <span className="font-medium text-xl text-primary">
                      {daysLeftInTrial}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">תום תקופת ניסיון</span>
                    <span className="font-medium">
                      {subscription?.trialEndsAt
                        ? format(new Date(subscription.trialEndsAt), "PPP", { locale: he })
                        : "-"}
                    </span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-4">
                    <p className="text-sm">
                      בסיום תקופת הניסיון יתבצע חיוב אוטומטי של{" "}
                      <span className="font-bold">₪{subscription?.billing_amount || 0}</span>
                      {" "}({subscription?.billing_cycle === "yearly" ? "שנתי" : "חודשי"})
                    </p>
                  </div>
                </>
              )}

              {subscription?.subscription_status === "active" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">חיוב הבא</span>
                    <span className="font-medium">
                      {subscription?.next_billing_date
                        ? format(new Date(subscription.next_billing_date), "PPP", { locale: he })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">סכום חיוב</span>
                    <span className="font-medium text-xl">
                      ₪{subscription?.billing_amount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">מחזור תשלום</span>
                    <span className="font-medium">
                      {subscription?.billing_cycle === "yearly" ? "שנתי" : "חודשי"}
                    </span>
                  </div>
                </>
              )}

              {subscription?.cancel_at_period_end && (
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg mt-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">המנוי יבוטל בתאריך:</p>
                    <p>
                      {subscription?.next_billing_date
                        ? format(new Date(subscription.next_billing_date), "PPP", { locale: he })
                        : "-"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/upgrade-subscription")}
                disabled={subscription?.subscription_status === "cancelled"}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                שדרג חבילה
              </Button>

              {subscription?.subscription_status !== "cancelled" &&
                !subscription?.cancel_at_period_end && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="ml-2 h-4 w-4" />
                    בטל מנוי
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              אמצעי תשלום
            </CardTitle>
            <CardDescription>נהל את פרטי התשלום שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                כרטיס האשראי שלך מאובטח ומוצפן
              </p>
              <p className="text-xs text-muted-foreground">
                פרטי כרטיס האשראי מנוהלים באמצעות Grow Payments
              </p>
            </div>

            <Button variant="outline" className="w-full" disabled>
              <CreditCard className="ml-2 h-4 w-4" />
              עדכן פרטי תשלום
              <span className="text-xs mr-2">(בקרוב)</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            היסטוריית תשלומים
          </CardTitle>
          <CardDescription>רשימת התשלומים שבוצעו</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין תשלומים עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {payment.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
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
                        <p className="text-xs text-red-600 mt-1">{payment.failure_reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">₪{payment.amount}</p>
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

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>בטל מנוי</DialogTitle>
            <DialogDescription>
              {subscription?.subscription_status === "trial"
                ? "תקופת הניסיון שלך תבוטל מיידית ולא תחויב."
                : "המנוי יבוטל בסוף תקופת החיוב הנוכחית. תמשיך ליהנות מהשירות עד אז."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>למה אתה מבטל? (אופציונלי)</Label>
              <select
                className="w-full p-2 border rounded-md"
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              חזור
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
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
    </div>
  );
}
