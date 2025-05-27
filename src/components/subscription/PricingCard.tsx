
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
      "relative flex flex-col justify-between text-right",
      "transition-all duration-300 hover:shadow-xl hover:scale-105",
      "rounded-2xl border-0 shadow-lg backdrop-blur-sm bg-white/95",
      "h-[500px] w-full max-w-sm mx-auto",
      isPopular && "ring-2 ring-blue-500 shadow-2xl scale-[1.05]"
    )}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            🔥 הפופולרי ביותר
          </span>
        </div>
      )}
      
      <CardHeader className="text-right pt-8 pb-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex justify-end items-baseline gap-2 mt-4">
          <span className="text-gray-500 text-lg">/חודש</span>
          <span className="text-5xl font-bold text-gray-900">₪{price}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow px-6">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-right">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 ml-auto" />
              <span className="text-gray-700 text-right flex-1">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-6 pb-8 px-6">
        <Button
          onClick={onSelect}
          size="lg"
          className={cn(
            "w-full py-6 text-lg font-bold transition-all rounded-2xl shadow-lg hover:shadow-xl",
            isPopular 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black"
          )}
        >
          בחר תוכנית
        </Button>
      </CardFooter>
    </Card>
  );
}
