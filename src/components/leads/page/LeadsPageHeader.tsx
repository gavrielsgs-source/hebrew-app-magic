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
      
      <div className="page-header mb-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="title-wrapper">
            <h1 className="page-title text-3xl font-bold text-foreground mb-2">ניהול לקוחות</h1>
            <p className="page-subtitle text-muted-foreground">נהל את כל הלקוחות והלידים שלך במקום אחד - מערכת ניהול מקצועית עם בקרה מלאה ונתונים בזמן אמת</p>
          </div>
          <button
            onClick={handleAddLead}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            הוסף לקוח חדש
          </button>
        </div>
      </div>
      
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
