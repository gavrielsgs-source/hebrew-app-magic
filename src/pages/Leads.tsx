import { useState } from "react";
import { LeadsGrid } from "@/components/leads/LeadsGrid";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from '@/contexts/subscription-context';
import { SubscriptionLimitAlert } from '@/components/subscription/SubscriptionLimitAlert';

export default function Leads() {
  const { toast } = useToast();
  const { addLead } = useLeads();
  const [isAddingLead, setIsAddingLead] = useState(false);
  const onLeadAdded = () => {
    toast({
      title: "ליד נוסף",
      description: "הליד נוסף בהצלחה!",
    });
  };
  const { data: leads = [], isLoading } = useLeads();
  const { checkEntitlement } = useSubscription();
  const canAddLead = checkEntitlement('leadLimit', leads.length + 1);

  return (
    <div className="p-6">
      <SubscriptionLimitAlert 
        featureKey="leadLimit" 
        currentCount={leads.length} 
        entityName="לקוחות" 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">לקוחות פוטנציאליים</h1>
          <p className="text-muted-foreground mt-1">
            ניהול ומעקב אחר לידים פוטנציאליים
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                size="sm" 
                className="flex items-center gap-2"
                disabled={!canAddLead}
              >
                <Plus className="h-4 w-4" />
                לקוח חדש
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px]">
              <SheetHeader>
                <SheetTitle>הוסף לקוח חדש</SheetTitle>
              </SheetHeader>
              <AddLeadForm onSuccess={onLeadAdded} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <LeadsGrid leads={leads} isLoading={isLoading} />
    </div>
  );
}
