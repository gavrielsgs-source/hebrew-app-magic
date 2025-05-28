
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings } from "lucide-react";
import { AddLeadForm } from "../AddLeadForm";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";

interface LeadsPageHeaderProps {
  isAddingLead: boolean;
  setIsAddingLead: (open: boolean) => void;
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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div className="text-right">
        <h1 className="text-2xl font-bold tracking-tight">לקוחות פוטנציאליים</h1>
        <p className="text-muted-foreground mt-1">
          ניהול ומעקב אחר לידים פוטנציאליים
        </p>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
        <NotificationsPopover />
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="h-4 w-4 ml-1.5" />
          הגדרות
        </Button>
        <SwipeDialog open={isAddingLead} onOpenChange={setIsAddingLead}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="flex items-center gap-2 flex-1"
              disabled={!canAddLead}
              onClick={() => setIsAddingLead(true)}
            >
              <Plus className="h-4 w-4 ml-1.5" />
              לקוח חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full sm:w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-right">הוסף לקוח חדש</DialogTitle>
            </DialogHeader>
            <AddLeadForm onSuccess={onLeadAdded} />
          </DialogContent>
        </SwipeDialog>
      </div>
    </div>
  );
}
