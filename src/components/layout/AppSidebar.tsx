import {
  LayoutDashboard as HomeIcon,
  Users as UsersIcon,
  Car as CarIcon,
  CheckSquare as CheckSquareIcon,
  MessageSquare as MessageSquareIcon,
  User as UserIcon,
  Crown as CrownIcon,
  ShieldAlert,
  Menu as MenuIcon
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar/sidebar-context"
import { useRoles } from "@/hooks/use-roles"
import { Button } from "@/components/ui/button"

const CarSleadLogoSVG = () => (
  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="10" fill="#1A1F2C"/>
    <path d="M20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40Z" fill="#33C3F0"/>
    <path d="M25 40H55" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M35 30L40 35L45 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50L40 45L45 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const { isAdmin } = useRoles();
  const isCollapsed = state === "collapsed";

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      )}
      <Sidebar>
        <SidebarContent className="border-l border-gray-700/20">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-3">
              <CarSleadLogoSVG />
              <span className="font-bold font-rubik text-lg tracking-tight text-white">CarsLead</span>
            </div>
          </SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="דף הבית" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/">
                  <HomeIcon className="text-white" />
                  <span>דף הבית</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="לקוחות" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/leads">
                  <UsersIcon className="text-white" />
                  <span>לקוחות</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="רכבים" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/cars">
                  <CarIcon className="text-white" />
                  <span>רכבים</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="משימות" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/tasks">
                  <CheckSquareIcon className="text-white" />
                  <span>משימות</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="תבניות" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/templates">
                  <MessageSquareIcon className="text-white" />
                  <span>תבניות</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator className="bg-white/20" />
            {isAdmin() && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ניהול מערכת" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                  <a href="/admin">
                    <ShieldAlert className="text-white" />
                    <span>ניהול מערכת</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="מנוי" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/subscription">
                  <CrownIcon className="text-white" />
                  <span>מנוי</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="פרופיל" className="text-white hover:bg-white/10 data-[active=true]:bg-white/20">
                <a href="/profile">
                  <UserIcon className="text-white" />
                  <span>פרופיל</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarFooter className="border-t border-white/10 mt-auto">
            {isCollapsed ? (
              <a
                href="https://carslead.co.il"
                target="_blank"
                rel="noreferrer"
                className="px-2 text-center text-xs text-white/70"
              >
                © 2024
              </a>
            ) : (
              <a
                href="https://carslead.co.il"
                target="_blank"
                rel="noreferrer"
                className="px-3 text-center text-sm text-white/70"
              >
                © 2024 CarsLead
              </a>
            )}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
