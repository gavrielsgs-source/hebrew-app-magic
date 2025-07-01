
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
  
  // Debug logging
  console.log('LimitAwareButton Debug:', {
    resourceType,
    currentCount,
    allowed,
    message,
    timestamp: new Date().toISOString()
  });
  
  const handleClick = () => {
    console.log('LimitAwareButton handleClick:', { allowed, currentCount, resourceType });
    if (allowed && onAction) {
      onAction();
    } else if (!allowed) {
      console.log('Limit reached, redirecting to upgrade or calling onUpgrade');
      if (onUpgrade) {
        onUpgrade();
      } else {
        navigate('/subscription/upgrade');
      }
    }
  };
  
  if (!allowed) {
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
  
  return (
    <Button 
      {...props}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
