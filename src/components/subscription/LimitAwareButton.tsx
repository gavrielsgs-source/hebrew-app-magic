
import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { useSubscriptionLimits, ResourceType } from '@/hooks/use-subscription-limits';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';

interface LimitAwareButtonProps extends ButtonProps {
  resourceType: ResourceType;
  currentCount: number;
  onAction?: () => void;
  onUpgrade?: () => void;
}

export function LimitAwareButton({
  resourceType,
  currentCount,
  onAction,
  onUpgrade,
  children,
  ...props
}: LimitAwareButtonProps) {
  const { checkLimitBeforeAction } = useSubscriptionLimits();
  const navigate = useNavigate();

  const { allowed, message } = checkLimitBeforeAction(resourceType, 'create', currentCount);
  
  console.log('🔍 [LimitAwareButton] Component rendered with:', {
    resourceType,
    currentCount,
    allowed,
    message,
    timestamp: new Date().toISOString(),
    props: {
      disabled: props.disabled,
      variant: props.variant
    }
  });
  
  const handleClick = (e: React.MouseEvent) => {
    console.log('🔍 [LimitAwareButton] Button clicked:', { 
      allowed, 
      currentCount, 
      resourceType,
      hasOnAction: !!onAction
    });
    
    // מניעת התפשטות האירוע
    e.preventDefault();
    e.stopPropagation();
    
    if (allowed && onAction) {
      console.log('🔍 [LimitAwareButton] Executing onAction');
      onAction();
    } else if (!allowed) {
      console.log('🔍 [LimitAwareButton] Limit reached, redirecting to upgrade or calling onUpgrade');
      if (onUpgrade) {
        onUpgrade();
      } else {
        navigate('/subscription/upgrade');
      }
    } else {
      console.log('🔍 [LimitAwareButton] No onAction provided but allowed=true');
    }
  };
  
  if (!allowed) {
    console.log('🔍 [LimitAwareButton] Rendering upgrade button due to limit reached');
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              {...props}
              variant="outline"
              onClick={handleClick}
            >
              שדרג מנוי
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  console.log('🔍 [LimitAwareButton] Rendering normal button - limit not reached');
  return (
    <Button 
      {...props}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
