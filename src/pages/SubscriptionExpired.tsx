import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CreditCard, Clock, Shield } from "lucide-react";
import { useSubscription } from "@/contexts/subscription-context";

export default function SubscriptionExpired() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-2xl w-full shadow-2xl border-destructive/20">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto bg-destructive/10 rounded-full p-6 w-fit">
            <Lock className="h-16 w-16 text-destructive animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold text-destructive">
            המנוי שלך הסתיים
          </CardTitle>
          <CardDescription className="text-lg">
            תקופת הניסיון והחסד הסתיימה. כדי להמשיך להשתמש במערכת, יש לשדרג את המנוי.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* מידע על המנוי הקודם */}
          {subscription?.tier && (
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground mb-2">המנוי הקודם שלך:</p>
              <p className="font-semibold text-lg capitalize">{subscription.tier}</p>
            </div>
          )}

          {/* מה קורה עכשיו */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              מה קורה עכשיו?
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span>כל הנתונים שלך שמורים ומאובטחים</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <span>הגישה למערכת חסומה עד שדרוג המנוי</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <span>אחרי התשלום תקבל גישה מיידית למערכת</span>
              </li>
            </ul>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate('/subscription/upgrade')}
              size="lg"
              className="w-full text-lg font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <CreditCard className="ml-2 h-5 w-5" />
              שדרג עכשיו וקבל גישה מיידית
            </Button>
            
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              צפה בחבילות ומחירים
            </Button>
          </div>

          {/* צור קשר */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              נתקלת בבעיה או יש שאלות?
            </p>
            <Button
              onClick={() => navigate('/contact')}
              variant="link"
              className="text-primary"
            >
              צור קשר עם התמיכה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
