
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AddLeadForm } from "../AddLeadForm";
import { LimitAwareButton } from "@/components/subscription/LimitAwareButton";
import { useLeads } from "@/hooks/use-leads";
import { useSubscription } from '@/contexts/subscription-context';
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LeadsTableHeaderProps {
  isAddLeadOpen: boolean;
  setIsAddLeadOpen: (open: boolean) => void;
}

export function LeadsTableHeader({ isAddLeadOpen, setIsAddLeadOpen }: LeadsTableHeaderProps) {
  const { leads } = useLeads();
  const { checkEntitlement } = useSubscription();
  const currentLeadCount = leads?.length || 0;
  const canAddLead = checkEntitlement('leadLimit', currentLeadCount + 1);

  const handleAddLead = () => {
    console.log('Add lead clicked from table header', { currentLeadCount, canAddLead });
    setIsAddLeadOpen(true);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <SwipeDialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogTrigger asChild>
          <LimitAwareButton 
            resourceType="lead"
            currentCount={currentLeadCount}
            onAction={handleAddLead}
            className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white shadow-lg"
          >
            <Plus className="ml-2 h-4 w-4" /> הוסף לקוח חדש
          </LimitAwareButton>
        </DialogTrigger>
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
            <AddLeadForm onSuccess={() => setIsAddLeadOpen(false)} />
          )}
        </DialogContent>
      </SwipeDialog>
    </div>
  );
}
