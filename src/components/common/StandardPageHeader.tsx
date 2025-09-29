import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StandardPageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    className?: string;
  };
  children?: ReactNode;
}

export function StandardPageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-white",
  iconBgColor = "bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C]",
  actionButton,
  children
}: StandardPageHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 border-b shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-full ${iconBgColor} flex items-center justify-center shadow-lg`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-rubik">
                {title}
              </h1>
              <p className="text-gray-500 text-lg">
                {subtitle}
              </p>
            </div>
          </div>
          
          {actionButton && (
            <Button
              onClick={actionButton.onClick}
              className={actionButton.className || "bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white shadow-lg px-6 py-3 text-base font-semibold"}
            >
              {actionButton.icon && <actionButton.icon className="ml-2 h-5 w-5" />}
              {actionButton.label}
            </Button>
          )}
        </div>
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}