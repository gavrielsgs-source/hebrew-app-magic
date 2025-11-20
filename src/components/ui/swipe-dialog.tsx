
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
    
    console.log('Touch start on mobile dialog');
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isMobile || !isDragging || startY === null || !e.touches.length) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    // Only allow dragging down
    if (deltaY > 0) {
      const resistance = Math.min(1, deltaY / 150);
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${deltaY * resistance}px)`;
        contentRef.current.style.opacity = `${1 - resistance * 0.2}`;
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
    
    // Reset transform
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      contentRef.current.style.transform = '';
      contentRef.current.style.opacity = '';
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = '';
        }
      }, 200);
    }
    
    // Close if dragged down enough
    if (deltaY > 80) {
      console.log('Closing dialog via swipe');
      onOpenChange?.(false);
    }

    setIsDragging(false);
    setStartY(null);
  }, [isMobile, isDragging, startY, onOpenChange]);

  React.useEffect(() => {
    if (!isMobile || !open || !contentRef.current) return;

    const element = contentRef.current;
    
    // Use passive listeners and proper cleanup
    const options = { passive: true };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, open, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent 
        ref={contentRef}
        className={isMobile ? "transition-none mobile-scroll safe-area-inset touch-action-manipulation" : ""}
        style={isMobile ? {
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'manipulation'
        } : {}}
      >
        {isMobile && (
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0 touch-none" />
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
