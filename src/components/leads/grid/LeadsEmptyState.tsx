
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { AddLeadForm } from "../AddLeadForm";
import { useSubscription } from '@/contexts/subscription-context';
import { LimitAwareButton } from "@/components/subscription/LimitAwareButton";
import { useLeads } from "@/hooks/use-leads";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function LeadsEmptyState() {
  const { leads } = useLeads();
  const { checkEntitlement } = useSubscription();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const currentLeadCount = leads?.length || 0;
  const canAddLead = checkEntitlement('leadLimit', currentLeadCount + 1);

  const handleAddLead = () => {
    console.log('Add lead clicked from empty state', { currentLeadCount, canAddLead });
    setIsSheetOpen(true);
  };

  const onLeadAdded = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="text-center p-8 border rounded-lg bg-muted/30">
      <h3 className="text-lg font-medium mb-2">אין לקוחות להצגה</h3>
      <p className="text-muted-foreground mb-4">
        הוסף לקוחות חדשים כדי לראות אותם כאן
      </p>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <LimitAwareButton 
            resourceType="lead"
            currentCount={currentLeadCount}
            onAction={handleAddLead}
          >
            <Plus className="mr-2 h-4 w-4" /> הוסף לקוח
          </LimitAwareButton>
        </SheetTrigger>
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>הוסף לקוח חדש</SheetTitle>
          </SheetHeader>
          
          {!canAddLead ? (
            <Alert className="border-red-200 bg-red-50 mt-4">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600 text-right">
                הגעת למגבלת המנוי. לא ניתן להוסיף עוד לקוחות. אנא שדרג את המנוי שלך.
              </AlertDescription>
            </Alert>
          ) : (
            <AddLeadForm onSuccess={onLeadAdded} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
