import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem as MenuItem,
  SidebarHeaderTitle,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  CalendarDays, 
  Car, 
  CreditCard, 
  Home, 
  List, 
  MessageSquare, 
  SettingsIcon, 
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
        <CarSleadLogoSVG />
        <SidebarHeaderTitle>CarsLead</SidebarHeaderTitle>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <div className="flex flex-col gap-2">
          <SidebarMenu key="main">
            <MenuItem
              onClick={() => navigate("/")}
              active={pathname === "/"}
              icon={<Home className="h-5 w-5" />}
              label="לוח בקרה"
            />

            <MenuItem
              onClick={() => navigate("/leads")}
              active={pathname === "/leads"}
              icon={<Users className="h-5 w-5" />}
              label="לידים"
            />

            <MenuItem
              onClick={() => navigate("/cars")}
              active={pathname === "/cars"}
              icon={<Car className="h-5 w-5" />}
              label="רכבים"
            />

            <MenuItem
              onClick={() => navigate("/tasks")}
              active={pathname === "/tasks"}
              icon={<CalendarDays className="h-5 w-5" />}
              label="משימות"
            />

            <MenuItem
              onClick={() => navigate("/templates")}
              active={pathname === "/templates"}
              icon={<MessageSquare className="h-5 w-5" />}
              label="תבניות"
            />
            
            <MenuItem
              onClick={() => navigate("/analytics")}
              active={pathname === "/analytics"}
              icon={<FileBarChart className="h-5 w-5" />}
              label="אנליטיקה מתקדמת"
            />
            
            {/* הוספת הקישור החדש */}
            <MenuItem
              onClick={() => navigate("/documents")}
              active={pathname === "/documents"}
              icon={<FileText className="h-5 w-5" />}
              label="מסמכים"
            />

            {isAdmin && (
              <MenuItem
                onClick={() => navigate("/admin")}
                active={pathname === "/admin"}
                icon={<SettingsIcon className="h-5 w-5" />}
                label="ניהול מערכת"
              />
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarContent className="border-t">
        <div className="flex flex-col gap-2">
          <SidebarMenu key="user">
            <MenuItem
              onClick={() => navigate("/profile")}
              active={pathname === "/profile"}
              icon={<User className="h-5 w-5" />}
              label="פרופיל"
            />

            <MenuItem
              onClick={() => navigate("/subscription")}
              active={pathname === "/subscription"}
              icon={<CreditCard className="h-5 w-5" />}
              label="מנוי"
            />
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
