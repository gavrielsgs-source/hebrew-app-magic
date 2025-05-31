
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function MobileHeader({ title, subtitle, className }: MobileHeaderProps) {
  return (
    <div className={cn("px-4 py-4 bg-white border-b", className)} dir="rtl">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-1 text-gray-900 text-right">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 text-right">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
