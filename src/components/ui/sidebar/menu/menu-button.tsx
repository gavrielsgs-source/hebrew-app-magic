
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "../sidebar-context"

// 🟣 עדכון עיצוב - מודגש, עבה, ריווח, אפקטים, פונט מרשים, אייקון
export const sidebarMenuButtonVariants = cva(
  // עיצוב עבה עם גובה גדל, פונט גדול, ריווח מודגש בין כפתורים
  "peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-xl p-3 mb-3 text-left text-lg font-bold font-rubik outline-none ring-sidebar-ring transition-all duration-200 focus-visible:ring-2 shadow-sm group hover-scale group-hover:scale-[1.03]",
  {
    variants: {
      variant: {
        default: "hover:bg-gradient-to-r hover:from-carslead-purple hover:to-carslead-blue hover:text-white bg-transparent text-sidebar-foreground data-[active=true]:bg-gradient-to-r data-[active=true]:from-carslead-purple data-[active=true]:to-carslead-blue data-[active=true]:text-white",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-gradient-to-r hover:from-carslead-purple hover:to-carslead-blue hover:text-white hover:shadow-lg",
      },
      size: {
        default: "h-14 text-lg",
        sm: "h-10 text-base",
        lg: "h-16 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          sidebarMenuButtonVariants({ variant, size }),
          // אייקון מופרד, גודל גדול, ריווח בין טקסט לאייקון
          "transition-all duration-200 shadow-sm group relative min-h-[3.5rem] px-5 py-3 focus:ring-2 focus:ring-carslead-blue",
          "[&>svg]:mr-2 [&>svg]:text-2xl [&>svg]:min-w-[28px] [&>svg]:min-h-[28px]",
          "hover:shadow-lg",
          "active:scale-[0.99]",
          className
        )}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...(typeof tooltip === "string" ? { children: tooltip } : tooltip)}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"
