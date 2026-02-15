import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddLeadForm } from "../AddLeadForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Users } from "lucide-react";
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
      
      <div className="bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-2xl p-6 border border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-2xl shadow-md border border-primary/20">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">
                ניהול לקוחות מתקדם
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                מערכת ניהול מקצועית לכל הלקוחות שלך • בקרה מלאה ונתונים בזמן אמת
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>מערכת פעילה</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>נתונים מסונכרנים</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleAddLead}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl px-8 h-12 font-bold text-base transition-all duration-300 hover:shadow-xl hover:scale-105 border-0"
            >
              <Plus className="h-5 w-5 ml-2" />
              הוסף לקוח חדש
            </Button>
            <Button 
              variant="outline"
              className="rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
            >
              דוחות
            </Button>
          </div>
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
