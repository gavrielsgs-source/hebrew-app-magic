
import { Button } from "@/components/ui/button";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AddLeadForm } from "../AddLeadForm";

interface LeadsTableHeaderProps {
  isAddLeadOpen: boolean;
  setIsAddLeadOpen: (open: boolean) => void;
}

export function LeadsTableHeader({ isAddLeadOpen, setIsAddLeadOpen }: LeadsTableHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <SwipeDialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white shadow-lg">
            <Plus className="ml-2 h-4 w-4" /> הוסף לקוח חדש
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף לקוח חדש</DialogTitle>
          </DialogHeader>
          <AddLeadForm onSuccess={() => setIsAddLeadOpen(false)} />
        </DialogContent>
      </SwipeDialog>
    </div>
  );
}
