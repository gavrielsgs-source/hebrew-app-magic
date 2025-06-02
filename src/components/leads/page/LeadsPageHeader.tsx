
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddLeadForm } from "../AddLeadForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Plus } from "lucide-react";
import { LimitAwareButton } from "@/components/subscription/LimitAwareButton";
import { SubscriptionLimitAlert } from "@/components/subscription/SubscriptionLimitAlert";
import { useLeads } from "@/hooks/use-leads";

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

  return (
    <>
      <SubscriptionLimitAlert 
        featureKey="leadLimit" 
        currentCount={currentLeadCount} 
        entityName="לקוחות פוטנציאליים" 
      />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול לקוחות</h1>
          <p className="text-gray-600 mt-1">נהל את כל הלקוחות והלידים שלך במקום אחד</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
            <LimitAwareButton 
              resourceType="lead"
              currentCount={currentLeadCount}
              onAction={() => setIsAddingLead(true)}
              className="bg-gradient-to-r from-carslead-purple to-carslead-blue hover:from-carslead-purple/90 hover:to-carslead-blue/90 text-white shadow-lg"
            >
              <Plus className="ml-2 h-4 w-4" />
              הוסף לקוח חדש
            </LimitAwareButton>
            
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
        </div>
      </div>
    </>
  );
}
