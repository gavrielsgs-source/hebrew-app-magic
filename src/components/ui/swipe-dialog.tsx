
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SwipeDialog({ children, onOpenChange, open, ...props }: SwipeDialogProps) {
  const isMobile = useIsMobile();
  const [startY, setStartY] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (!isMobile || !e.touches.length) return;
    
    // Prevent default scrolling behavior on iOS
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isMobile || !isDragging || startY === null || !e.touches.length) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    // Only allow dragging down and add resistance
    if (deltaY > 0) {
      const resistance = Math.min(1, deltaY / 200);
      if (contentRef.current) {
        // Use transform3d for better iOS performance
        contentRef.current.style.transform = `translate3d(0, ${deltaY * resistance}px, 0)`;
        contentRef.current.style.opacity = `${1 - resistance * 0.3}`;
      }
    }
  }, [isMobile, isDragging, startY]);

  const handleTouchEnd = React.useCallback((e: TouchEvent) => {
    if (!isMobile || !isDragging || startY === null) {
      setIsDragging(false);
      setStartY(null);
      return;
    }

    const touch = e.changedTouches?.[0];
    if (!touch) return;

    const deltaY = touch.clientY - startY;
    
    // Reset transform with transition
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      contentRef.current.style.transform = '';
      contentRef.current.style.opacity = '';
      
      // Remove transition after animation
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = '';
        }
      }, 300);
    }
    
    // Close dialog if dragged down enough
    if (deltaY > 100) {
      onOpenChange?.(false);
    }

    setIsDragging(false);
    setStartY(null);
  }, [isMobile, isDragging, startY, onOpenChange]);

  React.useEffect(() => {
    if (!isMobile || !open) return;

    const dialogContent = contentRef.current;
    if (!dialogContent) return;

    // Use passive: true for better iOS performance
    const options = { passive: false };
    
    dialogContent.addEventListener('touchstart', handleTouchStart, options);
    dialogContent.addEventListener('touchmove', handleTouchMove, options);
    dialogContent.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      dialogContent.removeEventListener('touchstart', handleTouchStart);
      dialogContent.removeEventListener('touchmove', handleTouchMove);
      dialogContent.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, open, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent 
        ref={contentRef}
        className={isMobile ? "transition-none mobile-scroll max-h-[90vh] overflow-y-auto safe-area-inset" : ""}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {isMobile && (
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0" />
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
