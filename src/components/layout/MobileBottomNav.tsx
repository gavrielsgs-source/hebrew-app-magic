
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Car, 
  Calendar, 
  Menu,
  User,
  Bell,
  Settings,
  FileText,
  BarChart,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: dashboardData } = useDashboardData();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isMobile) return null;

  const navItems = [
    {
      id: "dashboard",
      label: "דשבורד",
      icon: Home,
      path: "/dashboard",
      badge: null
    },
    {
      id: "leads",
      label: "לידים",
      icon: Users,
      path: "/leads",
      badge: dashboardData?.untreatedLeads?.length || 0
    },
    {
      id: "cars",
      label: "רכבים",
      icon: Car,
      path: "/cars",
      badge: dashboardData?.pendingCars?.length || 0
    },
    {
      id: "tasks",
      label: "משימות",
      icon: Calendar,
      path: "/tasks",
      badge: dashboardData?.todayTasks?.length || 0
    },
    {
      id: "menu",
      label: "עוד",
      icon: Menu,
      path: null,
      badge: null
    }
  ];

  const menuItems = [
    { id: "profile", label: "פרופיל", icon: User, path: "/profile" },
    { id: "analytics", label: "אנליטיקה", icon: BarChart, path: "/analytics" },
    { id: "documents", label: "מסמכים", icon: FileText, path: "/documents" },
    { id: "templates", label: "תבניות", icon: Settings, path: "/templates" },
    { id: "subscription", label: "מנוי", icon: CreditCard, path: "/subscription" }
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    return location.pathname.startsWith(path);
  };

  const isMenuItemActive = () => {
    return menuItems.some(item => location.pathname.startsWith(item.path));
  };

  const handleNavigation = (path: string | null, id: string) => {
    if (id === "menu") {
      setIsMenuOpen(true);
      return;
    }
    
    if (path) {
      navigate(path);
    }
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe" dir="rtl">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path ? isActive(item.path) : isMenuItemActive();
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px] relative",
                  active 
                    ? "bg-[#2F3C7E] text-white shadow-lg scale-105" 
                    : "text-gray-600 hover:text-[#2F3C7E] hover:bg-gray-50"
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "h-6 w-6 transition-transform",
                      active ? "scale-110" : ""
                    )} 
                  />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white rounded-full"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium transition-all",
                    active ? "font-bold" : ""
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh]" dir="rtl">
          <SheetHeader>
            <SheetTitle className="text-right">תפריט נוסף</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "h-20 flex flex-col gap-2 text-sm",
                    active && "bg-[#2F3C7E] text-white"
                  )}
                  onClick={() => handleMenuItemClick(item.path)}
                >
                  <Icon className="h-6 w-6" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
