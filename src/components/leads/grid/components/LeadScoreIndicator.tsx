
import { useLeadScoring } from "@/hooks/use-lead-scoring";
import { Flame, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LeadScoreIndicatorProps {
  leadId: string;
  className?: string;
}

export function LeadScoreIndicator({ leadId, className }: LeadScoreIndicatorProps) {
  const { getLeadScoreById, isLoading } = useLeadScoring();
  const leadScore = getLeadScoreById(leadId);
  
  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("animate-pulse", className)}>
        מחשב...
      </Badge>
    );
  }
  
  if (!leadScore) {
    return (
      <Badge variant="outline" className={className}>
        לא מדורג
      </Badge>
    );
  }
  
  let icon;
  let colorClass;
  let label;
  
  switch (leadScore.category) {
    case 'hot':
      icon = <Flame className="h-3 w-3 text-red-500" />;
      colorClass = "bg-red-100 text-red-800 hover:bg-red-200";
      label = "ליד חם";
      break;
    case 'warm':
      icon = <Thermometer className="h-3 w-3 text-amber-500" />;
      colorClass = "bg-amber-100 text-amber-800 hover:bg-amber-200";
      label = "ליד בינוני";
      break;
    case 'cold':
      icon = <Thermometer className="h-3 w-3 text-blue-500" />;
      colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-200";
      label = "ליד קר";
      break;
    default:
      icon = <Thermometer className="h-3 w-3 text-gray-500" />;
      colorClass = "bg-gray-100 text-gray-800 hover:bg-gray-200";
      label = "לא ידוע";
  }
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge variant="outline" className={cn("flex items-center gap-1", colorClass, className)}>
          {icon}
          {label}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">דירוג איכות ליד</h4>
            <Badge>{leadScore.score}/100</Badge>
          </div>
          
          <Progress value={leadScore.score} className="h-2" />
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium">גורמים משפיעים:</h5>
            <div className="space-y-1">
              {leadScore.factors.map((factor: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{factor.description}</span>
                  <span className={factor.impact > 0 ? "text-green-600" : factor.impact < 0 ? "text-red-600" : ""}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            עודכן ב-{new Date(leadScore.lastUpdated).toLocaleDateString('he-IL')}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
