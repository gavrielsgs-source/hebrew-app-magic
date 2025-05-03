
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
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  CalendarDays, 
  Car, 
  CreditCard, 
  Home, 
  List, 
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
              <SidebarMenuButton 
                onClick={() => navigate("/")} 
                data-active={pathname === "/"} 
                icon={<Home className="h-5 w-5" />}
              >
                לוח בקרה
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/leads")} 
                data-active={pathname === "/leads"} 
                icon={<Users className="h-5 w-5" />}
              >
                לידים
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/cars")} 
                data-active={pathname === "/cars"} 
                icon={<Car className="h-5 w-5" />}
              >
                רכבים
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/tasks")} 
                data-active={pathname === "/tasks"} 
                icon={<CalendarDays className="h-5 w-5" />}
              >
                משימות
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/templates")} 
                data-active={pathname === "/templates"} 
                icon={<MessageSquare className="h-5 w-5" />}
              >
                תבניות
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/analytics")} 
                data-active={pathname === "/analytics"} 
                icon={<FileBarChart className="h-5 w-5" />}
              >
                אנליטיקה מתקדמת
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/documents")} 
                data-active={pathname === "/documents"} 
                icon={<FileText className="h-5 w-5" />}
              >
                מסמכים
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/admin")} 
                  data-active={pathname === "/admin"} 
                  icon={<Settings className="h-5 w-5" />}
                >
                  ניהול מערכת
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarContent className="border-t">
        <div className="flex flex-col gap-2">
          <SidebarMenu key="user">
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/profile")} 
                data-active={pathname === "/profile"} 
                icon={<User className="h-5 w-5" />}
              >
                פרופיל
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate("/subscription")} 
                data-active={pathname === "/subscription"} 
                icon={<CreditCard className="h-5 w-5" />}
              >
                מנוי
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
