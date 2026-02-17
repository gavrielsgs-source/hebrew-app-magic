
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8" dir="rtl">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary bg-primary/10",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50",
                  isClickable && "cursor-pointer hover:scale-110"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </button>
              <span className={cn(
                "text-xs mt-1.5 whitespace-nowrap",
                isCurrent ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 mt-[-1rem]",
                index < currentStep ? "bg-primary" : "bg-muted-foreground/20"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
