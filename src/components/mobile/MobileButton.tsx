
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "success" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function MobileButton({ 
  children, 
  onClick, 
  variant = "primary",
  size = "lg",
  fullWidth = true,
  icon,
  className,
  disabled
}: MobileButtonProps) {
  const variants = {
    primary: "bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    outline: "border-2 border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white bg-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    xl: "h-16 px-10 text-xl"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-2xl font-semibold transition-all duration-200",
        "active:scale-95 shadow-lg hover:shadow-xl",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        "flex items-center justify-center gap-3",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </Button>
  );
}
