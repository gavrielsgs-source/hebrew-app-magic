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
  SidebarMain,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSeparator,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar/sidebar-context"

export function AppSidebar() {
  const { collapsed } = useSidebar()

  return (
    <Sidebar>
      <SidebarContent className="bg-background border-l border-border">
        <SidebarHeader>
          CarsLead
        </SidebarHeader>
        <SidebarMain>
          <SidebarMenu>
            <SidebarMenuItem href="/" icon={HomeIcon}>דף הבית</SidebarMenuItem>
            <SidebarMenuItem href="/leads" icon={UsersIcon}>לקוחות</SidebarMenuItem>
            <SidebarMenuItem href="/cars" icon={CarIcon}>רכבים</SidebarMenuItem>
            <SidebarMenuItem href="/tasks" icon={CheckSquareIcon}>משימות</SidebarMenuItem>
            <SidebarMenuItem href="/templates" icon={MessageSquareIcon}>תבניות</SidebarMenuItem>
            <SidebarMenuSeparator />
            <SidebarMenuItem href="/subscription" icon={CrownIcon}>מנוי</SidebarMenuItem>
            <SidebarMenuItem href="/profile" icon={UserIcon}>פרופיל</SidebarMenuItem>
          </SidebarMenu>
        </SidebarMain>
        <SidebarFooter>
          {collapsed ? (
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
