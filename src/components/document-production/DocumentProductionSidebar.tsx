import React from "react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_TYPES } from "@/types/document-production";
import {
  Sparkles,
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
} from "lucide-react";

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

export default function DocumentProductionSidebar() {
  return (
    <aside className="w-64 border-l border-border bg-card text-card-foreground flex flex-col">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-sm font-semibold">הפקת מסמכים</h2>
        </div>
        <Badge variant="secondary" className="text-xs">BETA</Badge>
      </div>
      <nav className="flex-1 overflow-auto py-2">
        <ul className="space-y-1 px-2">
          {/* חשבונית מס - פריט מיוחד */}
          <li>
            <NavLink
              to="/document-production/tax-invoice"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive ? "bg-accent text-accent-foreground" : ""
                }`
              }
            >
              <Receipt className="h-4 w-4" />
              <span className="ml-auto">חשבונית מס</span>
            </NavLink>
          </li>
          
          {/* שאר המסמכים מהרשימה */}
          {DOCUMENT_TYPES.map((doc) => {
            const IconComponent = iconMap[doc.icon as keyof typeof iconMap];
            return (
              <li key={doc.id}>
                <NavLink
                  to={`/document-production/${doc.id}`}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive ? "bg-accent text-accent-foreground" : ""
                    }`
                  }
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="ml-auto">{doc.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}