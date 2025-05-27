
import * as React from "react";
import { Dialog, DialogContent, DialogProps } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeDialogProps extends DialogProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function SwipeDialog({ children, onOpenChange, ...props }: SwipeDialogProps) {
  const isMobile = useIsMobile();
  const [startY, setStartY] = React.useState<number | null>(null);
  const [currentY, setCurrentY] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (!isMobile) return;
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isMobile || !isDragging || startY === null) return;
    setCurrentY(e.touches[0].clientY);
  }, [isMobile, isDragging, startY]);

  const handleTouchEnd = React.useCallback(() => {
    if (!isMobile || !isDragging || startY === null || currentY === null) {
      setIsDragging(false);
      setStartY(null);
      setCurrentY(null);
      return;
    }

    const deltaY = startY - currentY;
    
    // If swiped up more than 100px, close the dialog
    if (deltaY > 100) {
      onOpenChange?.(false);
    }

    setIsDragging(false);
    setStartY(null);
    setCurrentY(null);
  }, [isMobile, isDragging, startY, currentY, onOpenChange]);

  React.useEffect(() => {
    if (!isMobile) return;

    const dialogContent = document.querySelector('[role="dialog"]');
    if (!dialogContent) return;

    dialogContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    dialogContent.addEventListener('touchmove', handleTouchMove, { passive: true });
    dialogContent.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      dialogContent.removeEventListener('touchstart', handleTouchStart);
      dialogContent.removeEventListener('touchmove', handleTouchMove);
      dialogContent.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={isMobile ? "transition-transform duration-200" : ""}>
        {isMobile && (
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0" />
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
