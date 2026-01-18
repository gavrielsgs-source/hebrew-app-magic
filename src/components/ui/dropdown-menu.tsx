import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2",
      "rounded-xl px-3 py-2.5 text-sm font-medium",
      "outline-none transition-all duration-150",
      "focus:bg-accent hover:bg-accent/70",
      "data-[state=open]:bg-accent",
      "rtl:flex-row-reverse rtl:text-right",
      inset && "ltr:pl-8 rtl:pr-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ltr:ml-auto rtl:mr-auto h-4 w-4 opacity-60 rtl:rotate-180" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-[100] min-w-[12rem] overflow-hidden",
      "rounded-2xl border-2 border-border/50",
      "bg-popover/98 backdrop-blur-xl",
      "p-2 text-popover-foreground",
      "shadow-xl shadow-black/10",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3",
      "data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
      "rtl:text-right",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 8, align = "end", ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        // Base styles - modern card design
        "z-[100] min-w-[14rem] overflow-hidden",
        "rounded-2xl border-2 border-border/50",
        "bg-popover/98 backdrop-blur-xl",
        "p-2 text-popover-foreground",
        // Shadow for elevation
        "shadow-xl shadow-black/10",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3",
        "data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
        // RTL support
        "rtl:text-right",
        className
      )}
      role="menu"
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      // Base styles - modern item design
      "relative flex cursor-pointer select-none items-center gap-3",
      "rounded-xl px-3 py-2.5 text-sm font-medium",
      // States
      "outline-none transition-all duration-150",
      "focus:bg-accent focus:text-accent-foreground",
      "hover:bg-accent/70",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // RTL support
      "rtl:flex-row-reverse rtl:text-right",
      inset && "ltr:pl-8 rtl:pr-8",
      className
    )}
    role="menuitem"
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-3",
      "rounded-xl py-2.5 px-3 text-sm font-medium",
      "outline-none transition-all duration-150",
      "focus:bg-accent focus:text-accent-foreground",
      "hover:bg-accent/70",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "rtl:flex-row-reverse rtl:text-right",
      className
    )}
    checked={checked}
    role="menuitemcheckbox"
    {...props}
  >
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-primary/30 bg-background transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-3",
      "rounded-xl py-2.5 px-3 text-sm font-medium",
      "outline-none transition-all duration-150",
      "focus:bg-accent focus:text-accent-foreground",
      "hover:bg-accent/70",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "rtl:flex-row-reverse rtl:text-right",
      className
    )}
    role="menuitemradio"
    {...props}
  >
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background transition-colors">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
      "rtl:text-right",
      inset && "ltr:pl-8 rtl:pr-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-2 h-px bg-border/50", className)}
    role="separator"
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ltr:ml-auto rtl:mr-auto text-xs tracking-widest text-muted-foreground opacity-70", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
