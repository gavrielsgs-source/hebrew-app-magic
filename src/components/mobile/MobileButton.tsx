
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
  size = "md",
  fullWidth = true,
  icon,
  className,
  disabled
}: MobileButtonProps) {
  const variants = {
    primary: "bg-brand-primary hover:bg-brand-primary-light text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
    outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-primary-foreground bg-background",
    success: "bg-success hover:bg-success/90 text-success-foreground",
    danger: "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
    xl: "h-14 px-8 text-xl"
  };

  // Simple click handler - no delays or complex logic
  const handleClick = () => {
    console.log('MobileButton clicked - simple handler');
    
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-medium transition-colors",
        "active:scale-95",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </Button>
  );
}
