
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function MobileHeader({ title, subtitle, className }: MobileHeaderProps) {
  return (
    <div className={cn("px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white", className)} dir="rtl">
      <div className="text-center">
        {/* Enhanced title with better RTL alignment */}
        <h1 className="text-4xl font-bold mb-3 text-right">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl opacity-90 text-right">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
