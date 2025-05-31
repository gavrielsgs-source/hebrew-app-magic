
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      try {
        // Primary check - screen width
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const isSmallScreen = width < MOBILE_BREAKPOINT;
        
        // Secondary check - iOS/mobile detection with multiple fallbacks
        const userAgent = navigator.userAgent || '';
        const isIOSDevice = /iPad|iPhone|iPod/i.test(userAgent);
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Touch capability check
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Combine all checks for robust mobile detection
        const finalMobileState = isSmallScreen || isIOSDevice || (isMobileUserAgent && hasTouchSupport);
        
        console.log('Mobile detection:', {
          width,
          isSmallScreen,
          isIOSDevice,
          isMobileUserAgent,
          hasTouchSupport,
          finalMobileState,
          userAgent: userAgent.substring(0, 50)
        });
        
        setIsMobile(finalMobileState);
      } catch (error) {
        console.error('Error in mobile detection:', error);
        // Fallback - if we can't detect, assume mobile if screen is small
        const width = window.innerWidth || 800;
        setIsMobile(width < MOBILE_BREAKPOINT);
      }
    };

    // Initial check with small delay for iOS
    const initialTimeout = setTimeout(checkMobile, 50);

    // Media query listener as primary method
    let mediaQuery: MediaQueryList | null = null;
    try {
      mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      
      const handleMediaQueryChange = () => {
        setTimeout(checkMobile, 10); // Small delay for iOS
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleMediaQueryChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleMediaQueryChange);
      }
    } catch (e) {
      console.warn("MediaQuery not supported, using fallback");
    }

    // Resize and orientation listeners for iOS
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 100);
    };
    
    let resizeTimeout: NodeJS.Timeout;
    
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    // iOS specific - check after load
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', checkMobile, { once: true });
    }

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(resizeTimeout);
      
      if (mediaQuery) {
        const handleMediaQueryChange = () => {
          setTimeout(checkMobile, 10);
        };
        
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleMediaQueryChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleMediaQueryChange);
        }
      }
      
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return !!isMobile;
}
