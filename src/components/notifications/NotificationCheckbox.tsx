
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { NotificationPermissionCard } from "./NotificationPermissionCard";
import { usePushNotifications } from "@/hooks/use-push-notifications";

interface NotificationOption {
  value: string;
  label: string;
}

const notificationOptions: NotificationOption[] = [
  { value: "5_minutes", label: "5 דקות לפני" },
  { value: "30_minutes", label: "30 דקות לפני" },
  { value: "1_hour", label: "שעה לפני" },
  { value: "24_hours", label: "24 שעות לפני" },
];

interface NotificationCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  showOptions?: boolean;
  selectedOptions?: string[];
  onOptionsChange?: (options: string[]) => void;
}

export function NotificationCheckbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  showOptions = false,
  selectedOptions = [],
  onOptionsChange,
}: NotificationCheckboxProps) {
  const { permission, isSupported } = usePushNotifications();
  
  const handleOptionChange = (optionValue: string, isChecked: boolean) => {
    if (!onOptionsChange) return;
    
    if (isChecked) {
      onOptionsChange([...selectedOptions, optionValue]);
    } else {
      onOptionsChange(selectedOptions.filter(option => option !== optionValue));
    }
  };

  return (
    <div className="space-y-4">
      {/* הצגת כרטיס הרשאות אם צריך */}
      {permission !== "granted" && (
        <NotificationPermissionCard />
      )}
      
      {/* אפשרות ליצור תזכורות */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Checkbox
          id="notification-checkbox"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled || permission !== "granted"}
        />
        <Label
          htmlFor="notification-checkbox"
          className={`flex items-center gap-2 ${disabled || permission !== "granted" ? "text-gray-500" : ""}`}
        >
          <Bell className="h-4 w-4" />
          {label}
        </Label>
      </div>

      {/* אפשרויות תזכורת */}
      {showOptions && checked && permission === "granted" && (
        <div className="mr-6 space-y-2">
          <Label className="text-sm font-medium">בחר מתי לקבל תזכורת:</Label>
          <div className="grid grid-cols-2 gap-2">
            {notificationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id={`option-${option.value}`}
                  checked={selectedOptions.includes(option.value)}
                  onCheckedChange={(isChecked) => handleOptionChange(option.value, !!isChecked)}
                />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* הודעת עזרה */}
      {permission !== "granted" && isSupported && (
        <p className="text-xs text-gray-600">
          התראות אינן זמינות ללא הרשאות דפדפן. לחץ על "אפשר התראות" למעלה.
        </p>
      )}
    </div>
  );
}
