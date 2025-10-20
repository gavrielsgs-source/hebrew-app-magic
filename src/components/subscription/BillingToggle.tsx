import { Button } from "@/components/ui/button";

interface BillingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export function BillingToggle({ isYearly, onToggle }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <Button
        variant={!isYearly ? "default" : "outline"}
        onClick={() => onToggle(false)}
        className="px-6 py-2"
      >
        תשלום חודשי
      </Button>
      <Button
        variant={isYearly ? "default" : "outline"}
        onClick={() => onToggle(true)}
        className="px-6 py-2 relative"
      >
        תשלום שנתי
        <span className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          חסוך עד 18%
        </span>
      </Button>
    </div>
  );
}
