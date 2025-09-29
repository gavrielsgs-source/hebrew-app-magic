
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MobileButton } from "@/components/mobile/MobileButton";
import { 
  Home, 
  Users, 
  Car, 
  Calendar, 
  Menu,
  User,
  BarChart,
  FileText,
  Settings,
  CreditCard,
  ChevronDown,
  Sparkles,
  Receipt,
  ShoppingCart,
  RefreshCw,
  Zap,
  Truck,
  Calculator,
  Package,
  FileCheck,
  FilePlus,
  Handshake,
  Eye,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { DOCUMENT_TYPES } from "@/types/document-production";

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

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: dashboardData } = useDashboardData();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [docProductionExpanded, setDocProductionExpanded] = useState(false);

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
    { id: "team-management", label: "ניהול צוות", icon: Users, path: "/team-management" },
    { id: "analytics", label: "אנליטיקה", icon: BarChart, path: "/analytics" },
    { id: "documents", label: "מסמכים", icon: FileText, path: "/documents" },
    { id: "document-production", label: "הפקת מסמכים", icon: Sparkles, path: null, expandable: true, badge: "BETA" },
    { id: "templates", label: "תבניות", icon: Settings, path: "/templates" },
    { id: "subscription", label: "מנוי", icon: CreditCard, path: "/subscription" }
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) return true;
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

  const handleMenuItemClick = (path: string | null, expandable?: boolean) => {
    if (expandable) {
      setDocProductionExpanded(!docProductionExpanded);
    } else if (path) {
      navigate(path);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-2xl mobile-safe-bottom" dir="rtl">
        <div className="grid grid-cols-5 gap-1 px-2 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.path ? isActive(item.path) : isMenuItemActive();
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-2xl transition-all duration-300 relative min-h-[70px] mobile-touch-target",
                  active 
                    ? "bg-gradient-to-t from-[#2F3C7E] to-[#4CAF50] text-white shadow-lg transform scale-105" 
                    : "text-gray-600 hover:text-[#2F3C7E] hover:bg-gray-50 active:bg-gray-100"
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "h-7 w-7 transition-transform",
                      active ? "scale-110 text-white" : "text-gray-600"
                    )} 
                  />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white rounded-full border-2 border-white"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium transition-all leading-tight text-center max-w-full",
                    active ? "font-bold text-white" : "text-gray-600"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Extended Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl border-0 shadow-2xl" dir="rtl">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-right text-xl font-bold text-[#2F3C7E]">תפריט נוסף</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-4 pb-6 max-h-[50vh] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 touch-pan-y">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.path ? isActive(item.path) : false;
              
              return (
                <div key={item.id}>
                  <MobileButton
                    variant={active ? "primary" : "outline"}
                    size="xl"
                    onClick={() => handleMenuItemClick(item.path, item.expandable)}
                    icon={<Icon className="h-6 w-6" />}
                    className="justify-start w-full relative"
                  >
                    <span className="flex-1 text-right">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 mr-2">
                        {item.badge}
                      </Badge>
                    )}
                    {item.expandable && (
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform duration-200 ${
                          docProductionExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </MobileButton>
                  
                  {item.expandable && docProductionExpanded && (
                    <div className="flex flex-col gap-2 mt-3 pr-4">
                      {DOCUMENT_TYPES.map((doc) => {
                        const IconComponent = iconMap[doc.icon as keyof typeof iconMap];
                        const docPath = `/document-production/${doc.id}`;
                        const docActive = location.pathname === docPath;
                        return (
                          <MobileButton
                            key={doc.id}
                            variant={docActive ? "primary" : "outline"}
                            size="lg"
                            onClick={() => handleMenuItemClick(docPath)}
                            icon={<IconComponent className="h-4 w-4" />}
                            className="justify-start text-sm"
                          >
                            {doc.name}
                          </MobileButton>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
