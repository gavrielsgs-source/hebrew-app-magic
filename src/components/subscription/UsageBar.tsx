
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cva } from 'class-variance-authority';

const progressVariants = cva(
  "h-2",
  {
    variants: {
      status: {
        normal: "bg-primary",
        warning: "bg-orange-500",
        critical: "bg-destructive"
      }
    },
    defaultVariants: {
      status: "normal"
    }
  }
);

interface UsageBarProps {
  used: number;
  limit: number;
  label: string;
  showPercentage?: boolean;
  className?: string;
}

export function UsageBar({ 
  used, 
  limit, 
  label, 
  showPercentage = true,
  className = "" 
}: UsageBarProps) {
  // אם אין הגבלה, מציג "ללא הגבלה"
  const unlimited = limit === Infinity || limit === Number.MAX_SAFE_INTEGER;
  
  // חישוב אחוזים
  const percentage = unlimited ? 0 : Math.min(Math.round((used / limit) * 100), 100);
  
  // בחירת צבע לפי אחוז שימוש
  let status: "normal" | "warning" | "critical" = "normal";
  if (percentage >= 90) status = "critical";
  else if (percentage >= 75) status = "warning";
  
  return (
    <div className={`usage-bar ${className}`}>
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {used} {unlimited ? (
            <span className="text-muted-foreground">(ללא הגבלה)</span>
          ) : (
            <>
              / {limit} {showPercentage && <span className="text-muted-foreground">({percentage}%)</span>}
            </>
          )}
        </span>
      </div>
      {!unlimited && (
        <div className="w-full">
          <Progress value={percentage} className="h-2 bg-muted" />
        </div>
      )}
    </div>
  );
}
