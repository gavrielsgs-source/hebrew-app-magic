import React, { useState } from "react";
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
  const navigate = useNavigate();

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/production/${documentId}`);
    setIsOpen(false);
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        data-active={pathname.startsWith("/documents/production")}
        className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
      >
        <Sparkles className="h-5 w-5" />
        <span className="group-data-[collapsible=icon]:hidden flex items-center gap-2">
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
        <div className="absolute right-full top-0 mr-2 z-50 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl py-2">
          <div className="max-h-96 overflow-y-auto">
            {DOCUMENT_TYPES.map((doc) => {
              const IconComponent = iconMap[doc.icon as keyof typeof iconMap];
              return (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white text-gray-200"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{doc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}