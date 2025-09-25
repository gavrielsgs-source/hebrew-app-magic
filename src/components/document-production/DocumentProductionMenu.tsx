import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  FileText,
  CreditCard,
  ShoppingCart,
  RefreshCw,
  Zap,
  Truck,
  Car,
  Calculator,
  Package,
  FileCheck,
  FilePlus,
  Handshake,
  Eye,
  CheckSquare,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { DOCUMENT_TYPES } from "@/types/document-production";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  Receipt,
  FileText,
  CreditCard,
  ShoppingCart,
  RefreshCw,
  Zap,
  Truck,
  Car,
  Calculator,
  Package,
  FileCheck,
  FilePlus,
  Handshake,
  Eye,
  CheckSquare,
};

interface DocumentProductionMenuProps {
  pathname: string;
}

export function DocumentProductionMenu({ pathname }: DocumentProductionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setIsOpen(false);
      }
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
  };

  const handleDropdownMouseLeave = () => {
    setIsHovering(false);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/production/${documentId}`);
    setIsOpen(false);
    setIsHovering(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        data-active={pathname.startsWith("/documents/production")}
        className="flex w-full items-center gap-3 rounded-xl p-2.5 mb-2 text-base font-semibold font-rubik transition-all duration-200 hover:bg-gradient-to-r hover:from-carslead-purple hover:to-carslead-blue hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-carslead-purple data-[active=true]:to-carslead-blue data-[active=true]:text-white text-sidebar-foreground shadow hover:shadow-lg"
      >
        <Sparkles className="h-6 w-6 min-w-[24px]" />
        <span className="group-data-[collapsible=icon]:hidden flex items-center gap-2 flex-1">
          הפקת מסמכים
          <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
            BETA
          </Badge>
        </span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <div 
          className="absolute left-full top-0 ml-2 z-[9999] w-72 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl py-2 animate-in slide-in-from-right-2 duration-200"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="max-h-96 overflow-y-auto">
            {DOCUMENT_TYPES.map((doc) => {
              const IconComponent = iconMap[doc.icon as keyof typeof iconMap];
              return (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 hover:bg-accent hover:text-accent-foreground text-card-foreground rounded-md mx-1"
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="text-right flex-1">{doc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}