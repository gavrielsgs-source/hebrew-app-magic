import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  CalendarDays, 
  Car, 
  CreditCard, 
  Home, 
  MessageSquare, 
  Settings, 
  User, 
  Users,
  FileBarChart,
  FileText,
} from "lucide-react";

const CarSleadLogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="10" fill="#1A1F2C"/>
    <path d="M20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40Z" fill="#33C3F0"/>
    <path d="M25 40H55" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M35 30L40 35L45 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50L40 45L45 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const navigate = useNavigate();

  const isAdmin = role === "admin";

  return (
    <Sidebar className="border-l z-40">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2">
          <CarSleadLogoSVG />
          <h1 className="text-lg font-bold text-white">CarsLead</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <div className="flex flex-col gap-2 px-4">
          <SidebarMenu key="main">
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/dashboard")}
                data-active={pathname === "/dashboard"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <Home className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">לוח בקרה</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/leads")}
                data-active={pathname === "/leads"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <Users className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">לידים</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/cars")}
                data-active={pathname === "/cars"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <Car className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">רכבים</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/tasks")}
                data-active={pathname === "/tasks"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <CalendarDays className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">משימות</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/templates")}
                data-active={pathname === "/templates"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">תבניות</span>
              </button>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/analytics")}
                data-active={pathname === "/analytics"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <FileBarChart className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">אנליטיקה מתקדמת</span>
              </button>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/documents")}
                data-active={pathname === "/documents"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <FileText className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">מסמכים</span>
              </button>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarMenuItem>
                <button
                  onClick={() => navigate("/admin")}
                  data-active={pathname === "/admin"}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
                >
                  <Settings className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">ניהול מערכת</span>
                </button>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarContent className="border-t border-gray-700/50 mt-auto">
        <div className="flex flex-col gap-2 px-4 py-4">
          <SidebarMenu key="user">
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/profile")}
                data-active={pathname === "/profile"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <User className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">פרופיל</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/subscription")}
                data-active={pathname === "/subscription"}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white text-gray-200"
              >
                <CreditCard className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">מנוי</span>
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
