import React from "react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_TYPES } from "@/types/document-production";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
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
    <Sidebar side="right" variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Badge variant="secondary" className="text-xs">BETA</Badge>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">הפקת מסמכים</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-right">מסמכים</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* חשבונית מס - פריט מיוחד */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/document-production/tax-invoice"
                    end
                    className="flex items-center gap-3 text-right w-full"
                  >
                    <Receipt className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">חשבונית מס</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* שאר המסמכים מהרשימה */}
              {DOCUMENT_TYPES.map((doc) => {
                const IconComponent = iconMap[doc.icon as keyof typeof iconMap];
                return (
                  <SidebarMenuItem key={doc.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/document-production/${doc.id}`}
                        end
                        className="flex items-center gap-3 text-right w-full"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{doc.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}