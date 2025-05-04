
import React from 'react';
import { Lock } from "lucide-react";
import { useSubscription } from '@/contexts/subscription-context';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSubscriptionLimits } from '@/hooks/use-subscription-limits';

type FeatureType = 'advancedAnalytics' | 'customReports' | 'automatedWorkflows' | 'apiAccess';

interface SubscriptionGatedFeatureProps {
  feature: FeatureType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGatedFeature({ 
  feature, 
  children, 
  fallback 
}: SubscriptionGatedFeatureProps) {
  const navigate = useNavigate();
  const { isFeatureAvailable, getTierLabel } = useSubscriptionLimits();
  const { subscription } = useSubscription();
  
  const isAvailable = isFeatureAvailable(feature);
  
  const getFeatureLabel = (feature: FeatureType): string => {
    switch (feature) {
      case 'advancedAnalytics': return 'אנליטיקה מתקדמת';
      case 'customReports': return 'דוחות מותאמים אישית';
      case 'automatedWorkflows': return 'תהליכי עבודה אוטומטיים';
      case 'apiAccess': return 'גישה ל-API';
      default: return feature;
    }
  };
  
  const getRequiredTier = (feature: FeatureType): string => {
    switch (feature) {
      case 'advancedAnalytics': return getTierLabel('business');
      case 'customReports': return getTierLabel('enterprise');
      case 'automatedWorkflows': return getTierLabel('business');
      case 'apiAccess': return getTierLabel('enterprise');
      default: return getTierLabel('premium');
    }
  };
  
  if (!isAvailable) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="locked-feature flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/30 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">{getFeatureLabel(feature)} אינה זמינה במנוי שלך</h3>
        <p className="text-muted-foreground">
          תכונה זו זמינה בחבילת {getRequiredTier(feature)} ומעלה
        </p>
        <Button 
          variant="default" 
          className="mt-4"
          onClick={() => navigate('/subscription/upgrade')}
        >
          שדרג את המנוי שלך
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
}
