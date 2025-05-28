
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  contentClassName?: string;
  dir?: string;
}

export function MobileCard({ 
  children, 
  className, 
  header, 
  contentClassName,
  dir
}: MobileCardProps) {
  return (
    <Card 
      className={cn(
        "w-full shadow-lg border-0 rounded-3xl bg-white overflow-hidden",
        "hover:shadow-xl transition-all duration-300",
        className
      )}
      dir={dir}
    >
      {header && (
        <CardHeader className="pb-4">
          {header}
        </CardHeader>
      )}
      <CardContent className={cn("p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
