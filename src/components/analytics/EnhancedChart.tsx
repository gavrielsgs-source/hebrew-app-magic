
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartInsight } from "./ChartInsight";
import { ReactNode } from "react";

interface EnhancedChartProps {
  title: string;
  description?: string;
  insight: {
    title: string;
    description: string;
    type: "success" | "warning" | "danger" | "info" | "neutral";
    trend?: "up" | "down" | "stable";
    percentage?: number;
  };
  children: ReactNode;
  className?: string;
}

export function EnhancedChart({ 
  title, 
  description, 
  insight, 
  children, 
  className 
}: EnhancedChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-right">{title}</CardTitle>
        {description && (
          <CardDescription className="text-right">{description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <ChartInsight {...insight} />
        {children}
      </CardContent>
    </Card>
  );
}
