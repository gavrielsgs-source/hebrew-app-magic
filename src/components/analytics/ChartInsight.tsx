
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartInsightProps {
  title: string;
  description: string;
  type: "success" | "warning" | "danger" | "info" | "neutral";
  trend?: "up" | "down" | "stable";
  percentage?: number;
  className?: string;
}

export function ChartInsight({ 
  title, 
  description, 
  type, 
  trend, 
  percentage,
  className 
}: ChartInsightProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          badgeVariant: "default" as const,
          badgeColor: "bg-green-500",
          icon: <CheckCircle className="h-4 w-4" />
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          badgeVariant: "secondary" as const,
          badgeColor: "bg-yellow-500",
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case "danger":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          badgeVariant: "destructive" as const,
          badgeColor: "bg-red-500",
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case "info":
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          badgeVariant: "outline" as const,
          badgeColor: "bg-blue-500",
          icon: <Info className="h-4 w-4" />
        };
      default:
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          badgeVariant: "secondary" as const,
          badgeColor: "bg-gray-500",
          icon: <Info className="h-4 w-4" />
        };
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const styles = getTypeStyles();

  return (
    <Card className={cn(
      "mb-4 transition-all duration-200 hover:shadow-md",
      styles.bgColor,
      styles.borderColor,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-full", styles.badgeColor, "bg-opacity-10")}>
            <div className={styles.textColor}>
              {styles.icon}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn("font-semibold text-sm", styles.textColor)}>
                {title}
              </h4>
              
              {trend && percentage !== undefined && (
                <Badge variant={styles.badgeVariant} className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className="text-xs">
                    {percentage > 0 ? '+' : ''}{percentage}%
                  </span>
                </Badge>
              )}
            </div>
            
            <p className={cn("text-sm leading-relaxed", styles.textColor, "opacity-90")}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
