
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Edit, MessageSquare, Calendar, Phone, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";

interface LeadCardActionsProps {
  leadId: string;
  leadName: string;
  leadPhone?: string;
  onEdit: () => void;
  onDelete: () => void;
  onWhatsApp: () => void;
  onSchedule: () => void;
}

export function LeadCardActions({ 
  leadId, 
  leadName, 
  leadPhone, 
  onEdit, 
  onDelete, 
  onWhatsApp, 
  onSchedule 
}: LeadCardActionsProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const isMobile = useIsMobile();

  // Create WhatsApp link with the lead's phone number
  const handleWhatsAppClick = () => {
    if (leadPhone) {
      // Remove any non-digit characters and ensure proper format
      const cleanPhone = leadPhone.replace(/\D/g, '');
      const phoneNumber = cleanPhone.startsWith('972') ? cleanPhone : `972${cleanPhone.replace(/^0/, '')}`;
      const message = encodeURIComponent(`שלום ${leadName}, אני פונה אליך מחברת המכוניות שלנו.`);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
    onWhatsApp();
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Primary actions row */}
        <div className="flex gap-3">
          <MobileButton
            variant="outline"
            size="sm"
            onClick={handleWhatsAppClick}
            icon={<MessageSquare className="h-5 w-5" />}
            className="flex-1 h-14 text-lg rounded-2xl bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            וואטסאפ
          </MobileButton>
          <MobileButton
            variant="outline"
            size="sm"
            onClick={() => setShowAddTask(true)}
            icon={<Calendar className="h-5 w-5" />}
            className="flex-1 h-14 text-lg rounded-2xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            משימה
          </MobileButton>
        </div>

        {/* Secondary actions row */}
        <div className="flex gap-3">
          <MobileButton
            variant="outline"
            size="sm"
            onClick={onSchedule}
            icon={<Phone className="h-5 w-5" />}
            className="flex-1 h-12 rounded-2xl"
          >
            פגישה
          </MobileButton>
          <MobileButton
            variant="outline"
            size="sm"
            onClick={onEdit}
            icon={<Edit className="h-5 w-5" />}
            className="flex-1 h-12 rounded-2xl"
          >
            עריכה
          </MobileButton>
          <MobileButton
            variant="outline"
            size="sm"
            onClick={onDelete}
            icon={<Trash2 className="h-5 w-5" />}
            className="flex-1 h-12 rounded-2xl text-red-600 border-red-200 hover:bg-red-50"
          >
            מחק
          </MobileButton>
        </div>

        {/* Add Task Dialog */}
        <AddTaskDialog
          open={showAddTask}
          onOpenChange={setShowAddTask}
          initialLeadId={leadId}
          onSuccess={() => setShowAddTask(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppClick}
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        וואטסאפ
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAddTask(true)}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Calendar className="h-4 w-4 mr-1" />
        משימה
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSchedule}
      >
        <Phone className="h-4 w-4 mr-1" />
        פגישה
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4 mr-1" />
        עריכה
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        מחק
      </Button>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        initialLeadId={leadId}
        onSuccess={() => setShowAddTask(false)}
      />
    </div>
  );
}
