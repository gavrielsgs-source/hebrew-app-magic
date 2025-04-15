
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Car, CalendarCheck, Users, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      title: "דשבורד",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "רכבים",
      icon: Car,
      path: "/cars",
    },
    {
      title: "משימות",
      icon: CalendarCheck,
      path: "/tasks",
    },
    {
      title: "פרופיל",
      icon: Users,
      path: "/profile",
    },
  ];

  return (
    <Sidebar side="right">
      <SidebarHeader className="p-4 border-b">
        <Button variant="ghost" onClick={() => navigate("/")} className="w-full justify-start gap-2">
          <Home className="h-5 w-5" />
          <span className="font-bold">CarsLead</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={location.pathname === item.path}
                tooltip={item.title}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
