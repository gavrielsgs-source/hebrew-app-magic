
import {
  LayoutDashboard as HomeIcon,
  Users as UsersIcon,
  Car as CarIcon,
  CheckSquare as CheckSquareIcon,
  MessageSquare as MessageSquareIcon,
  User as UserIcon,
  Crown as CrownIcon,
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
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar/sidebar-context"
import LogoCarslead from "@/assets/logo-carslead.svg" // נניח שהקובץ קיים בתיקיית assets

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar>
      <SidebarContent className="bg-background border-l border-border">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <img
              src={LogoCarslead}
              alt="CarsLead Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold font-rubik text-lg tracking-tight">CarsLead</span>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="דף הבית">
              <a href="/">
                <HomeIcon />
                <span>דף הבית</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="לקוחות">
              <a href="/leads">
                <UsersIcon />
                <span>לקוחות</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="רכבים">
              <a href="/cars">
                <CarIcon />
                <span>רכבים</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="משימות">
              <a href="/tasks">
                <CheckSquareIcon />
                <span>משימות</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="תבניות">
              <a href="/templates">
                <MessageSquareIcon />
                <span>תבניות</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="מנוי">
              <a href="/subscription">
                <CrownIcon />
                <span>מנוי</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="פרופיל">
              <a href="/profile">
                <UserIcon />
                <span>פרופיל</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarFooter>
          {isCollapsed ? (
            <a
              href="https://carslead.co.il"
              target="_blank"
              rel="noreferrer"
              className="px-2 text-center text-xs text-muted-foreground"
            >
              © 2024
            </a>
          ) : (
            <a
              href="https://carslead.co.il"
              target="_blank"
              rel="noreferrer"
              className="px-3 text-center text-sm text-muted-foreground"
            >
              © 2024 CarsLead
            </a>
          )}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
