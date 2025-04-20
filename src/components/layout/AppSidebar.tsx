
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar/index";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Car, 
  Home, 
  User, 
  Calendar, 
  LogOut, 
  Settings,
  FileText,
  Users,
  Activity,
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("התנתקת בהצלחה");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("שגיאה בהתנתקות");
    }
  };
  
  // Navigation items
  const mainNavItems = [
    { path: "/", label: "דשבורד", icon: Home },
    { path: "/cars", label: "רכבים", icon: Car },
    { path: "/leads", label: "לקוחות", icon: Users },
    { path: "/tasks", label: "משימות", icon: Calendar },
    { path: "/templates", label: "הודעות ותבניות", icon: Send },
  ];
  
  const userNavItems = [
    { path: "/profile", label: "פרופיל משתמש", icon: User },
    { path: "/settings", label: "הגדרות", icon: Settings },
  ];

  return (
    <Sidebar className="border-l">
      <SidebarHeader className="py-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Avatar className="w-9 h-9 border-2 border-primary/20 bg-primary/10">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white text-lg font-bold">
              {profile?.full_name?.[0] || user?.email?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <div className="font-semibold text-base text-foreground">
              {profile?.full_name || "משתמש"}
            </div>
            <div className="text-xs text-muted-foreground">
              {profile?.position || user?.email}
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ניווט</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="text-sidebar-foreground/80" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <Separator className="my-4" />
        
        <SidebarGroup>
          <SidebarGroupLabel>ניהול משתמש</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="text-sidebar-foreground/80" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="text-sidebar-foreground/80" />
                  <span>התנתק</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="pb-6">
        <div className="w-full px-4">
          <Button className="w-full" size="sm" variant="outline">
            <SidebarTrigger />
            <span className="mr-2">כווץ תפריט</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
