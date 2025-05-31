
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      try {
        // Simple and reliable mobile detection
        const width = window.innerWidth;
        const isSmallScreen = width < MOBILE_BREAKPOINT;
        
        // Basic iOS/mobile detection
        const userAgent = navigator.userAgent || '';
        const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent);
        
        // Touch support check
        const hasTouchSupport = 'ontouchstart' in window;
        
        // Final decision - simpler logic
        const finalMobileState = isSmallScreen || isIOSDevice || (isMobileUserAgent && hasTouchSupport);
        
        console.log('Mobile detection (simplified):', {
          width,
          isSmallScreen,
          isIOSDevice,
          finalMobileState
        });
        
        setIsMobile(finalMobileState);
      } catch (error) {
        console.error('Error in mobile detection:', error);
        // Fallback - assume mobile if screen is small
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };

    // Initial check
    checkMobile();

    // Simple resize listener
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isMobile;
}
