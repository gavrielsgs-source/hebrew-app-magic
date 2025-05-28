
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
  className?: string;
  gradient?: boolean;
}

export function MobileHeader({ 
  title, 
  subtitle, 
  action, 
  onBack,
  className,
  gradient = true
}: MobileHeaderProps) {
  return (
    <div className={cn(
      "w-full p-6 rounded-b-3xl text-white mb-6",
      gradient ? "bg-gradient-to-l from-[#2F3C7E] to-[#4CAF50]" : "bg-[#2F3C7E]",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-xl"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        )}
        {action && !onBack && action}
        {!onBack && !action && <div />}
      </div>
      
      <div className="text-right">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-white/80 text-base">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
