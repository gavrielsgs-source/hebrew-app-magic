
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
  const [currentY, setCurrentY] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setCurrentY(touch.clientY);
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isMobile || !isDragging || startY === null) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    // Only allow dragging down
    if (deltaY > 0) {
      setCurrentY(touch.clientY);
      setDragOffset(deltaY);
      
      // Add some resistance to the drag
      const resistance = Math.min(1, deltaY / 200);
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${deltaY * resistance}px)`;
        contentRef.current.style.opacity = `${1 - resistance * 0.3}`;
      }
    }
  }, [isMobile, isDragging, startY]);

  const handleTouchEnd = React.useCallback(() => {
    if (!isMobile || !isDragging || startY === null || currentY === null) {
      setIsDragging(false);
      setStartY(null);
      setCurrentY(null);
      setDragOffset(0);
      return;
    }

    const deltaY = currentY - startY;
    
    // Reset transform
    if (contentRef.current) {
      contentRef.current.style.transform = '';
      contentRef.current.style.opacity = '';
    }
    
    // If dragged down more than 100px, close the dialog
    if (deltaY > 100) {
      onOpenChange?.(false);
    }

    setIsDragging(false);
    setStartY(null);
    setCurrentY(null);
    setDragOffset(0);
  }, [isMobile, isDragging, startY, currentY, onOpenChange]);

  React.useEffect(() => {
    if (!isMobile || !open) return;

    const dialogContent = contentRef.current;
    if (!dialogContent) return;

    dialogContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    dialogContent.addEventListener('touchmove', handleTouchMove, { passive: false });
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
        className={isMobile ? "transition-transform duration-200 mobile-scroll" : ""}
      >
        {isMobile && (
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0 mobile-touch-target" />
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
