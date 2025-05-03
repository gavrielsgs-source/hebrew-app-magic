
import * as React from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useSidebar } from "../sidebar-context"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "right",
      variant = "sidebar",
      collapsible = "icon",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-full sm:w-[--sidebar-width] bg-gradient-to-b from-gray-900 to-gray-800 text-white p-0 [&>button]:hidden"
            style={
              {
                "--sidebar-width": "18rem",
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col overflow-y-auto">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        className="peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        <div
          className={cn(
            "fixed inset-y-0 z-10 flex h-svh transition-all duration-300 ease-in-out",
            side === "left" ? "left-0" : "right-0",
            state === "expanded" ? "w-[--sidebar-width]" : "w-[--sidebar-width-icon]",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl border-l border-gray-700/30"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"
