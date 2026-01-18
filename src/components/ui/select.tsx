import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles - modern rounded design
      "flex h-11 w-full items-center justify-between gap-2",
      "rounded-xl border-2 border-input bg-background/95 backdrop-blur-sm",
      "px-4 py-2.5 text-sm font-medium",
      // Focus & ring styles - accessibility
      "ring-offset-background transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:border-primary",
      // Hover state
      "hover:border-primary/50 hover:bg-accent/50",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      // RTL support
      "rtl:flex-row-reverse rtl:text-right",
      "[&>span]:line-clamp-1 [&>span]:rtl:text-right [&>span]:rtl:w-full",
      // Shadow for depth
      "shadow-sm hover:shadow-md",
      className
    )}
    aria-label={props["aria-label"] || "בחר אפשרות"}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180 rtl:ml-0 rtl:mr-2" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Base styles - modern card design
        "relative z-[100] max-h-[320px] min-w-[12rem] overflow-hidden",
        "rounded-2xl border-2 border-border/50",
        "bg-popover/98 backdrop-blur-xl",
        "text-popover-foreground",
        // Shadow for elevation
        "shadow-xl shadow-black/10",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-3 data-[side=left]:slide-in-from-right-3",
        "data-[side=right]:slide-in-from-left-3 data-[side=top]:slide-in-from-bottom-3",
        // Position adjustments
        position === "popper" &&
          "data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2",
        className
      )}
      position={position}
      role="listbox"
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
      "rtl:text-right ltr:text-left",
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Base styles - modern item design
      "relative flex w-full cursor-pointer select-none items-center justify-end",
      "rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-right",
      // States
      "outline-none transition-all duration-150",
      "focus:bg-accent focus:text-accent-foreground",
      "hover:bg-accent/70",
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Selected state
      "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary data-[state=checked]:font-semibold",
      className
    )}
    role="option"
    {...props}
  >
    <span className="absolute left-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-2 h-px bg-border/50", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
