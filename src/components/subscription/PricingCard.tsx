import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  isPopular,
  onSelect
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative flex flex-col text-right",
      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
      "rounded-2xl border-0 shadow-lg backdrop-blur-sm bg-white/95",
      "w-full max-w-sm mx-auto min-h-[480px]",
      "overflow-hidden",
      isPopular && "ring-2 ring-blue-500 shadow-2xl scale-[1.02] md:scale-[1.05]"
    )}>
      {isPopular && (
        <div className="absolute -top-3 md:-top-4 left-0 right-0 flex justify-center z-10">
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
            🔥 הפופולרי ביותר
          </span>
        </div>
      )}
      
      <CardHeader className="text-right pt-4 md:pt-6 pb-3 md:pb-4 px-4 md:px-6 flex-shrink-0">
        <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full text-center mb-3">
          14 ימי ניסיון חינם!
        </div>
        <div className="space-y-1 md:space-y-2">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm md:text-base text-gray-600">{description}</p>
        </div>
        <div className="flex justify-end items-baseline gap-1 md:gap-2 mt-3 md:mt-4">
          <span className="text-gray-500 text-sm md:text-lg">/חודש</span>
          <span className="text-3xl md:text-5xl font-bold text-gray-900">₪{price}</span>
        </div>
        <p className="text-xs text-gray-500 text-center">לאחר תום תקופת הניסיון</p>
      </CardHeader>
      
      <CardContent className="flex-1 px-4 md:px-6 py-2 flex flex-col justify-center">
        <ul className="space-y-2 md:space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 md:gap-3 text-right">
              <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 ml-auto" />
              <span className="text-sm md:text-base text-gray-700 text-right flex-1">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-4 pb-4 md:pb-6 px-4 md:px-6 flex-shrink-0">
        <Button
          onClick={onSelect}
          size="lg"
          className={cn(
            "w-full py-4 md:py-6 text-base md:text-lg font-bold transition-all rounded-2xl shadow-lg hover:shadow-xl",
            "min-h-[48px] md:min-h-[56px]",
            isPopular 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
          )}
        >
          התחל ניסיון חינם
        </Button>
      </CardFooter>
    </Card>
  );
}