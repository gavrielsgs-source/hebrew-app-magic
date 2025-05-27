
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { useState } from "react";

interface NotificationCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  showOptions?: boolean;
  selectedOptions?: string[];
  onOptionsChange?: (options: string[]) => void;
}

export function NotificationCheckbox({ 
  checked, 
  onCheckedChange, 
  label = "צור תזכורת",
  disabled = false,
  showOptions = false,
  selectedOptions = [],
  onOptionsChange
}: NotificationCheckboxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const notificationOptions = [
    { value: "5_minutes", label: "5 דקות לפני" },
    { value: "1_hour", label: "שעה לפני" },
    { value: "24_hours", label: "24 שעות לפני" }
  ];

  const handleMainCheckboxChange = (newChecked: boolean) => {
    onCheckedChange(newChecked);
    if (!newChecked) {
      setIsExpanded(false);
      onOptionsChange?.([]);
    } else if (showOptions) {
      setIsExpanded(true);
    }
  };

  const handleOptionChange = (optionValue: string, optionChecked: boolean) => {
    if (!onOptionsChange) return;
    
    let newOptions;
    if (optionChecked) {
      newOptions = [...selectedOptions, optionValue];
    } else {
      newOptions = selectedOptions.filter(opt => opt !== optionValue);
    }
    onOptionsChange(newOptions);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox 
          id="notification-checkbox" 
          checked={checked}
          onCheckedChange={handleMainCheckboxChange}
          disabled={disabled}
        />
        <Label 
          htmlFor="notification-checkbox" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {label}
        </Label>
      </div>

      {/* Notification Options */}
      {checked && showOptions && isExpanded && (
        <div className="mr-6 space-y-2 border-r-2 border-blue-200 pr-4">
          <Label className="text-xs text-gray-600 font-medium">בחר זמני תזכורת:</Label>
          {notificationOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`option-${option.value}`}
                checked={selectedOptions.includes(option.value)}
                onCheckedChange={(checked) => handleOptionChange(option.value, checked as boolean)}
                disabled={disabled}
              />
              <Label
                htmlFor={`option-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
