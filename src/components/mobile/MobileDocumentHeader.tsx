import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MobileDocumentHeaderProps {
  title: string;
  icon?: React.ReactNode;
  onBack?: () => void;
}

export function MobileDocumentHeader({ title, icon, onBack }: MobileDocumentHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/document-production");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 md:hidden">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className="flex items-center gap-2"
      >
        <ArrowRight className="h-4 w-4" />
        <span>חזור</span>
      </Button>
      
      <div className="flex items-center gap-2">
        {icon}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  );
}