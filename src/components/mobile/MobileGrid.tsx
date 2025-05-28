
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileGridProps {
  children: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

export function MobileGrid({ 
  children, 
  className, 
  spacing = "md" 
}: MobileGridProps) {
  const spacingMap = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6"
  };

  return (
    <div className={cn(
      "grid grid-cols-1 w-full",
      spacingMap[spacing],
      className
    )}>
      {children}
    </div>
  );
}
