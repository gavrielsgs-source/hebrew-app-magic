
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
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

  const toggleExpanded = () => {
    if (checked && showOptions) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-3 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox 
            id="notification-checkbox" 
            checked={checked}
            onCheckedChange={handleMainCheckboxChange}
            disabled={disabled}
            className="data-[state=checked]:bg-[#2F3C7E] data-[state=checked]:border-[#2F3C7E]"
          />
          <Label 
            htmlFor="notification-checkbox" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
          >
            <Bell className="h-4 w-4 text-[#2F3C7E]" />
            {label}
          </Label>
        </div>

        {/* Expand/Collapse Button */}
        {checked && showOptions && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center gap-1 text-sm text-[#2F3C7E] hover:text-blue-600 transition-colors"
          >
            <span>אפשרויות תזכורת</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Notification Options */}
      {checked && showOptions && isExpanded && (
        <div className="mr-6 space-y-3 border-r-2 border-[#2F3C7E]/20 pr-4">
          <Label className="text-xs text-slate-600 font-medium">בחר זמני תזכורת (ניתן לבחור כמה):</Label>
          <div className="space-y-2">
            {notificationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`option-${option.value}`}
                  checked={selectedOptions.includes(option.value)}
                  onCheckedChange={(checked) => handleOptionChange(option.value, checked as boolean)}
                  disabled={disabled}
                  className="data-[state=checked]:bg-[#2F3C7E] data-[state=checked]:border-[#2F3C7E]"
                />
                <Label
                  htmlFor={`option-${option.value}`}
                  className="text-sm cursor-pointer hover:text-[#2F3C7E] transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          
          {selectedOptions.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                נבחרו {selectedOptions.length} תזכורות: {selectedOptions.map(opt => 
                  notificationOptions.find(no => no.value === opt)?.label
                ).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
