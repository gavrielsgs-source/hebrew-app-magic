
import { useSubscription } from "@/contexts/subscription-context";
import { SubscriptionGatedFeature } from "@/components/subscription/SubscriptionGatedFeature";
import { BasicAnalytics } from "./BasicAnalytics";
import { FullAnalytics } from "./FullAnalytics";
import { CustomAnalytics } from "./CustomAnalytics";

export function AnalyticsDashboard() {
  const { subscription } = useSubscription();

  // Determine which analytics component to show based on subscription level
  const renderAnalytics = () => {
    switch (subscription.analyticsLevel) {
      case 'custom':
        return <CustomAnalytics />;
      case 'full':
        return <FullAnalytics />;
      case 'basic':
      default:
        return <BasicAnalytics />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Always show basic analytics, but gate advanced features */}
      {subscription.analyticsLevel === 'basic' && (
        <div>
          <BasicAnalytics />
          
          {/* Show what they're missing */}
          <div className="mt-8 space-y-4">
            <SubscriptionGatedFeature
              feature="advancedAnalytics"
              fallback={
                <div className="border border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">גרפים וניתוחים מתקדמים</h3>
                  <p className="text-muted-foreground mb-4">
                    קבל תובנות עמוקות יותר עם גרפים אינטראקטיביים, השוואות תקופות ומגמות
                  </p>
                  <p className="text-sm text-muted-foreground">
                    זמין בחבילת ביזנס ומעלה
                  </p>
                </div>
              }
            >
              <div />
            </SubscriptionGatedFeature>

            <SubscriptionGatedFeature
              feature="customReports"
              fallback={
                <div className="border border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">דוחות מותאמים אישית</h3>
                  <p className="text-muted-foreground mb-4">
                    צור דוחות מותאמים לצרכים שלך, ייצא נתונים ותקבל תחזיות AI
                  </p>
                  <p className="text-sm text-muted-foreground">
                    זמין בחבילת אנטרפרייז
                  </p>
                </div>
              }
            >
              <div />
            </SubscriptionGatedFeature>
          </div>
        </div>
      )}

      {subscription.analyticsLevel === 'full' && (
        <div>
          <FullAnalytics />
          
          {/* Show enterprise features preview */}
          <div className="mt-8">
            <SubscriptionGatedFeature
              feature="customReports"
              fallback={
                <div className="border border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">תכונות אנטרפרייז</h3>
                  <p className="text-muted-foreground mb-4">
                    תחזיות AI, דוחות מותאמים אישית, ניתוח רווחיות מתקדם ועוד
                  </p>
                  <p className="text-sm text-muted-foreground">
                    זמין בחבילת אנטרפרייז
                  </p>
                </div>
              }
            >
              <div />
            </SubscriptionGatedFeature>
          </div>
        </div>
      )}

      {subscription.analyticsLevel === 'custom' && <CustomAnalytics />}
    </div>
  );
}
