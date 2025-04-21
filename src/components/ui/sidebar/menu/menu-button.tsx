
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "../sidebar-context"

// עיצוב רענן ומעט מוקטן, עדיין עבה/מרווח
export const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl p-2.5 mb-2 text-left text-base font-semibold font-rubik outline-none ring-sidebar-ring transition-all duration-200 focus-visible:ring-2 shadow group hover-scale group-hover:scale-[1.03]",
  {
    variants: {
      variant: {
        default: "hover:bg-gradient-to-r hover:from-carslead-purple hover:to-carslead-blue hover:text-white bg-transparent text-sidebar-foreground data-[active=true]:bg-gradient-to-r data-[active=true]:from-carslead-purple data-[active=true]:to-carslead-blue data-[active=true]:text-white",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-gradient-to-r hover:from-carslead-purple hover:to-carslead-blue hover:text-white hover:shadow-lg",
      },
      size: {
        default: "h-12 text-base",
        sm: "h-9 text-sm",
        lg: "h-14 text-lg",
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
          // אייקון גדול, ריווח וטקסט מרווח ועדין יותר
          "transition-all duration-200 shadow-sm group relative min-h-[3rem] px-4 py-2.5 focus:ring-2 focus:ring-carslead-blue",
          "[&>svg]:mr-2 [&>svg]:text-xl [&>svg]:min-w-[24px] [&>svg]:min-h-[24px]",
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

