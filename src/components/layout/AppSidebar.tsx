
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
    <Sidebar className="border-l">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <CarSleadLogoSVG />
          <h1 className="text-lg font-bold">CarsLead</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <div className="flex flex-col gap-2">
          <SidebarMenu key="main">
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/")}
                data-active={pathname === "/"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <Home className="h-5 w-5 ml-2" />
                <span>לוח בקרה</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/leads")}
                data-active={pathname === "/leads"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <Users className="h-5 w-5 ml-2" />
                <span>לידים</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/cars")}
                data-active={pathname === "/cars"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <Car className="h-5 w-5 ml-2" />
                <span>רכבים</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/tasks")}
                data-active={pathname === "/tasks"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <CalendarDays className="h-5 w-5 ml-2" />
                <span>משימות</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/templates")}
                data-active={pathname === "/templates"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <MessageSquare className="h-5 w-5 ml-2" />
                <span>תבניות</span>
              </button>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/analytics")}
                data-active={pathname === "/analytics"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <FileBarChart className="h-5 w-5 ml-2" />
                <span>אנליטיקה מתקדמת</span>
              </button>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/documents")}
                data-active={pathname === "/documents"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <FileText className="h-5 w-5 ml-2" />
                <span>מסמכים</span>
              </button>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarMenuItem>
                <button
                  onClick={() => navigate("/admin")}
                  data-active={pathname === "/admin"}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                >
                  <Settings className="h-5 w-5 ml-2" />
                  <span>ניהול מערכת</span>
                </button>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarContent className="border-t">
        <div className="flex flex-col gap-2">
          <SidebarMenu key="user">
            <SidebarMenuItem>
              <button
                onClick={() => navigate("/profile")}
                data-active={pathname === "/profile"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <User className="h-5 w-5 ml-2" />
                <span>פרופיל</span>
              </button>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <button
                onClick={() => navigate("/subscription")}
                data-active={pathname === "/subscription"}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <CreditCard className="h-5 w-5 ml-2" />
                <span>מנוי</span>
              </button>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
