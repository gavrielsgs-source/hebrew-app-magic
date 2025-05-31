
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsappDialogHeaderProps {
  onClose: () => void;
  title: string;
}

export function WhatsappDialogHeader({ onClose, title }: WhatsappDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b" dir="rtl">
      <h2 className="text-lg font-semibold text-right">{title}</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
      >
        <X className="h-6 w-6" />
      </Button>
    </div>
  );
}
