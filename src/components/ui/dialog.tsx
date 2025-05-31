import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Mobile optimized styles - smaller and better scrolling
          isMobile ? [
            "inset-x-3 top-[8%] bottom-[8%]",
            "max-h-[84vh] w-[calc(100vw-1.5rem)]",
            "overflow-hidden rounded-xl",
            "data-[state=closed]:slide-out-to-bottom-[8%] data-[state=open]:slide-in-from-bottom-[8%]",
            "flex flex-col"
          ] : [
            "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
            "w-full max-w-lg max-h-[85vh] border rounded-lg",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "overflow-hidden flex flex-col"
          ],
          className
        )}
        onOpenAutoFocus={(e) => {
          // Focus management for accessibility - fixed TypeScript error
          const target = e.currentTarget as HTMLElement;
          const firstInput = target.querySelector('input, textarea, select, button');
          if (firstInput) {
            e.preventDefault();
            (firstInput as HTMLElement).focus();
          }
        }}
        {...props}
      >
        {/* Header with close button */}
        <div className="relative flex-shrink-0 p-4 pb-2">
          <DialogPrimitive.Close className={cn(
            "absolute opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none rounded-sm",
            "left-3 top-3 h-8 w-8 flex items-center justify-center hover:bg-accent"
          )} aria-label="Close">
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </DialogPrimitive.Close>
        </div>
        
        {/* Scrollable content area with better mobile scrolling */}
        <div className={cn(
          "flex-1 overflow-y-auto px-4 pb-4 -mt-2",
          isMobile && "scrollbar-thin scrollbar-thumb-gray-300"
        )}>
          <div className="min-h-0 space-y-1">
            {children}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-right mb-4",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sticky bottom-0 bg-background border-t p-4 mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-right",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground text-right", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
