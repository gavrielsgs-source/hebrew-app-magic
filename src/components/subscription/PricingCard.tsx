
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
      "transition-all duration-300 hover:shadow-lg",
      "border border-gray-200 backdrop-blur-sm",
      isPopular && "border-blue-500 shadow-lg scale-[1.02]",
      "sm:max-w-[350px] mx-auto"
    )}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            פופולרי
          </span>
        </div>
      )}
      
      <CardHeader className="text-right pt-8">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <div className="flex justify-end items-baseline gap-1">
          <span className="text-gray-500">/חודש</span>
          <span className="text-4xl font-bold">₪{price}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 flex-row-reverse">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-6 pb-8">
        <Button
          onClick={onSelect}
          className={cn(
            "w-full py-6 text-lg transition-all",
            isPopular 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-900 hover:bg-gray-800"
          )}
        >
          בחר תוכנית
        </Button>
      </CardFooter>
    </Card>
  );
}
