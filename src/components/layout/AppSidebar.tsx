
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

// יצירת גלוף של תמונת הלוגו בתוך Base64 במידה והלוגו מהנתיב לא ייטען
const fallbackLogoBase64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iMTAiIGZpbGw9IiM2MDUxQTAiLz4KPHBhdGggZD0iTTIwIDQwQzIwIDI4Ljk1NDMgMjguOTU0MyAyMCA0MCAyMEM1MS4wNDU3IDIwIDYwIDI4Ljk1NDMgNjAgNDBDNjAgNTEuMDQ1NyA1MS4wNDU3IDYwIDQwIDYwQzI4Ljk1NDMgNjAgMjAgNTEuMDQ1NyAyMCA0MFoiIGZpbGw9IiMzM0MzRjAiLz4KPHBhdGggZD0iTTI1IDQwSDU1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMzUgMzBMNDAgMzVMNDUgMzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0zNSA1MEw0MCA0NUw0NSA1MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==`;

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar>
      <SidebarContent className="bg-gradient-to-b from-carslead-purple to-carslead-purple/90 text-white border-l border-carslead-purple/20">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <img
              src="/logo-carslead.svg"
              alt="CarsLead Logo"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // אם הלוגו לא נטען, נשתמש בגלוף שיצרנו
                const img = e.target as HTMLImageElement;
                img.src = fallbackLogoBase64;
              }}
            />
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
  );
}
