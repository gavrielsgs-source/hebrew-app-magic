
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

interface NotificationCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function NotificationCheckbox({ 
  checked, 
  onCheckedChange, 
  label = "צור תזכורת",
  disabled = false 
}: NotificationCheckboxProps) {
  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Checkbox 
        id="notification-checkbox" 
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Label 
        htmlFor="notification-checkbox" 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
      >
        <Bell className="h-4 w-4" />
        {label}
      </Label>
    </div>
  );
}
