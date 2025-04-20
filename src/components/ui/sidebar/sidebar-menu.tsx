
import * as React from "react"
import { cn } from "@/lib/utils"

// Re-export all menu components
export * from "./menu/menu-button"
export * from "./menu/menu-item"
export * from "./menu/menu-sub"
export * from "./menu/menu-utils"

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuSeparator = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-separator"
    className={cn("my-1", className)}
    aria-hidden="true"
  >
    <div className="h-px bg-sidebar-border" />
  </li>
))
SidebarMenuSeparator.displayName = "SidebarMenuSeparator"
