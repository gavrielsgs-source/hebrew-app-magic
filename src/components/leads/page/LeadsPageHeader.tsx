import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddLeadForm } from "../AddLeadForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Users } from "lucide-react";
import { LimitAwareButton } from "@/components/subscription/LimitAwareButton";
import { SubscriptionLimitAlert } from "@/components/subscription/SubscriptionLimitAlert";
import { useLeads } from "@/hooks/use-leads";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";

interface LeadsPageHeaderProps {
  isAddingLead: boolean;
  setIsAddingLead: (adding: boolean) => void;
  canAddLead: boolean;
  onLeadAdded: () => void;
  setActiveTab: (tab: string) => void;
}

export function LeadsPageHeader({
  isAddingLead,
  setIsAddingLead,
  canAddLead,
  onLeadAdded,
  setActiveTab
}: LeadsPageHeaderProps) {
  const { leads } = useLeads();
  const currentLeadCount = leads?.length || 0;

  console.log('LeadsPageHeader rendered - both buttons should work consistently');

  const handleAddLead = () => {
    console.log('Add lead clicked from header', { currentLeadCount, canAddLead });
    setIsAddingLead(true);
  };

  return (
    <>
      <SubscriptionLimitAlert 
        resourceType="lead" 
        currentCount={currentLeadCount} 
      />
      
      <StandardPageHeader
        title="ניהול לקוחות"
        subtitle="נהל את כל הלקוחות והלידים שלך במקום אחד"
        icon={Users}
        actionButton={{
          label: "הוסף לקוח חדש",
          onClick: handleAddLead,
          icon: Plus
        }}
      />
      
      <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
        <DialogContent className="w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף לקוח חדש</DialogTitle>
          </DialogHeader>
          
          {!canAddLead ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600 text-right">
                הגעת למגבלת המנוי. לא ניתן להוסיף עוד לקוחות. אנא שדרג את המנוי שלך.
              </AlertDescription>
            </Alert>
          ) : (
            <AddLeadForm onSuccess={onLeadAdded} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
