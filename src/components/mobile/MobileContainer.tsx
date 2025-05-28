
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
  withBottomNav?: boolean;
}

export function MobileContainer({ 
  children, 
  className, 
  withPadding = true,
  withBottomNav = true 
}: MobileContainerProps) {
  return (
    <div 
      className={cn(
        "min-h-screen bg-gray-50 w-full",
        withPadding && "px-4 py-6",
        withBottomNav && "pb-24",
        className
      )}
      dir="rtl"
    >
      {children}
    </div>
  );
}
